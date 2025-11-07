// File: CheckoutStepperModal.js
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  makeStyles,
  Stepper,
  Step,
  StepLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton
} from "@material-ui/core";
import DeleteIcon from "@material-ui/icons/Delete";
import { toast } from "react-toastify";
import usePayments from "../../hooks/usePayments";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import CustomerAddressModal from "../CustomerAddressModal";
import NumberFormat from "react-number-format";

const useStyles = makeStyles(theme => ({
  formControl: { margin: theme.spacing(1), minWidth: 120 },
  // multFieldLine: { display: "flex", gap: theme.spacing(1), flexWrap: "wrap" },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": { marginRight: theme.spacing(1) }
  },
  stepContent: { marginTop: theme.spacing(2) },
  table: { marginTop: theme.spacing(2) }
}));

const CheckoutStepperModal = ({ open, onClose, pedido, onConfirm }) => {
  const classes = useStyles();
  const [activeStep, setActiveStep] = useState(0);
  const [payments, setPayments] = useState([]);
  const [partialPayments, setPartialPayments] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [installments, setInstallments] = useState("1");
  const [paymentAmount, setPaymentAmount] = useState(0);
  const [changeValue, setChangeValue] = useState(0);
  const [customersAddress, setCustomersAddress] = useState([]);
  const [customerAddressModalOpen, setCustomertAddressModalOpen] =
    useState(false);
  const [form, setForm] = useState({
    typeDelivery: "",
    address: "",
    cupom: ""
  });

  const { list: listPayments, finder: get } = usePayments();

  useEffect(() => {
    setForm({ typeDelivery: "", address: "", cupom: "" });
    setPaymentMethod(null);
    setInstallments("1");
    setPartialPayments([]);
    setPaymentAmount(0);
    setChangeValue(0);
    setActiveStep(0);
  }, [open]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const list = await listPayments();
        console.log('list =>',list);
        setPayments(list);
      } catch (err) {
        toastError(err);
      }
    };
    fetchPayments();
  }, []);

  useEffect(() => {
    const fetchCustomerAddressStore = async () => {
      try {
        if (!pedido?.customerId) return;
        const { data } = await api.get(
          `/customers/address/all/${pedido.customerId}`
        );
        setCustomersAddress(data.customerAddress);
      } catch (err) {
        toastError(err);
      }
    };
    fetchCustomerAddressStore();
  }, [pedido]);

  const total = useMemo(
    () => pedido?.itens?.reduce((acc, i) => acc + i.price * i.amount, 0) || 0,
    [pedido]
  );
  const aplicarCupom = (valorTotal, cupom) => {
    const match = cupom?.match(/^LOJA(\d{1,2})$/i);
    if (match) {
      const desconto = parseInt(match[1], 10);
      return valorTotal - valorTotal * (desconto / 100);
    }
    return valorTotal;
  };
  const valorFinal = aplicarCupom(total, form.cupom);
  const somaPagamentos = partialPayments.reduce(
    (acc, cur) => acc + cur.value,
    0
  );
  const valorRestante = valorFinal - somaPagamentos;

  const handleAddPayment = async () => {
    if (!paymentMethod || !paymentAmount || paymentAmount <= 0) {
      return toast.error("Informe método e valor válido");
    }

    const metodoDuplicado = partialPayments.some(
      p => p.method.id === paymentMethod.id
    );
    if (metodoDuplicado)
      return toast.error("Este método de pagamento já foi utilizado");
    if (somaPagamentos + paymentAmount > valorFinal)
      return toast.error("Valor total excedido");

    const novo = {
      method: paymentMethod,
      value: paymentAmount,
      change: paymentMethod?.typePayment?.change ? changeValue : 0,
      installments: installments ?? "1"
    };
    const novosPagamentos = [...partialPayments, novo];
    const novaSoma = novosPagamentos.reduce((acc, cur) => acc + cur.value, 0);

    setPartialPayments(novosPagamentos);
    setPaymentMethod(null);
    setPaymentAmount(valorFinal - novaSoma);
    setChangeValue(0);
    setInstallments("1");
  };

  const hadleEditCustomerAddress = () => {
    setCustomertAddressModalOpen(true);
  };

  const hadleCloseCustomerAddress = () => {
    const fetchCustomerAddressStore = async () => {
      try {
        if (!pedido?.customerId) return;
        const { data } = await api.get(
          `/customers/address/all/${pedido.customerId}`
        );
        setCustomersAddress(data.customerAddress);
      } catch (err) {
        toastError(err);
      }
    };
    fetchCustomerAddressStore();
    setCustomertAddressModalOpen(false);
  };

  const handleRemovePayment = index => {
    const novos = [...partialPayments];
    novos.splice(index, 1);
    const novaSoma = novos.reduce((acc, cur) => acc + cur.value, 0);
    setPartialPayments(novos);
    setPaymentAmount(valorFinal - novaSoma);
  };

  const availableInstallments = useMemo(() => {
    if (paymentMethod?.paymentDetails.length > 0) {
      return paymentMethod.paymentDetails
        .filter(detail => valorRestante >= detail.minimumValue)
        .sort((a, b) => a.installments - b.installments);
    }
    return [];
  }, [paymentMethod, valorRestante]);

  const handleFinish = async () => {
    if (somaPagamentos < valorFinal) {
      return toast.error(
        `O valor total de R$ ${valorFinal} ainda não foi quitado (R$${somaPagamentos}).`
      );
    }
    
    if (form.typeDelivery === "entrega" && !form.address) {
      return toast.error("Selecione um endereço de entrega");
    }

    const pedidoFinal = {
      ...pedido,
      typeDelivery: form.typeDelivery,
      addressId: form.typeDelivery === "entrega" ? form.address : null,
      coupon: form.cupom,
      total: valorFinal,
      payments: partialPayments
    };
    try {
      //localStorage.removeItem(`pedido_${pedido.ticketId}`);  
      //onConfirm(pedidoFinal);
      //onClose();
      //toast.success("Pedido finalizado com sucesso!");
        const { data } = await api.post("/budgets", pedidoFinal)
        localStorage.removeItem(`pedido_${pedidoFinal.ticketId}`);  
        toast.success("Pedido finalizado com sucesso!");
        onConfirm(pedidoFinal);
        onClose();
      
    } catch (error) {
      localStorage.setItem(`pedido_${pedido.ticketId}`, JSON.stringify(pedidoFinal));
      toast.error("Pedido não finalizado com error!\n" + error);
      
    }
  };

  const steps = ["Entrega ou Retirada", "Pagamento", "Confirmação"];
  const getEnderecoFormatado = () => {
    const address = customersAddress.find(e => e.id === form.addressId);
    return address
      ? `${address.name} - ${address.address}, ${address.number} - ${address.neighborhood}, ${address.city} - ${address.state}`
      : "Não informado";
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <CustomerAddressModal
        customerId={pedido?.customerId}
        open={customerAddressModalOpen}
        onClose={hadleCloseCustomerAddress}
      />
      <DialogTitle>Finalizar Pedido</DialogTitle>
      <DialogContent>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map(label => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <div className={classes.stepContent}>
          {activeStep === 0 && (
            <>
              <FormControl fullWidth margin="dense">
                <InputLabel>Tipo de Entrega</InputLabel>
                <Select
                  name="typeDelivery"
                  value={form.typeDelivery}
                  onChange={e =>
                    setForm(prev => ({ ...prev, typeDelivery: e.target.value }))
                  }
                >
                  <MenuItem value="retirada">Retirada</MenuItem>
                  <MenuItem value="entrega">Entrega</MenuItem>
                </Select>
              </FormControl>
              {form.typeDelivery === "entrega" &&
                customersAddress.length > 0 && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Endereço de Entrega</InputLabel>
                    <Select
                      name="address"
                      value={form.address}
                      required
                      onChange={e =>
                        setForm(prev => ({ ...prev, address: e.target.value }))
                      }
                    >
                      {customersAddress.map(address => (
                        <MenuItem key={address.id} value={address.id}>
                          {`${address.name} - ${address.address}, ${address.number} - ${address.neighborhood}, ${address.city} - ${address.state}`}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}
            </>
          )}

          {activeStep === 1 && (
            <>
              <div className={classes.multFieldLine}>
                <FormControl fullWidth margin="dense">
                  <InputLabel>Forma de Pagamento</InputLabel>
                  <Select
                    value={paymentMethod?.id || ""}
                    onChange={async e => {
                      const method = await get(e.target.value);
                      setPaymentMethod(method);
                      setPaymentAmount(valorRestante);
                      if (method?.typePayment?.change) setChangeValue(0);
                    }}
                    disabled={valorRestante <= 0}
                  >
                    {payments.map(p => (
                      <MenuItem key={p.id} value={p.id}>
                        {p.name}
                      </MenuItem>
                    ))}
                  </Select>
                  {valorRestante <= 0 && (
                    <Typography color="error" variant="body2">
                      Total já quitado, nenhum lançamento de pagamento será necessário.
                    </Typography>
                  )}
                </FormControl>

                {paymentMethod?.typePayment?.installments && (
                  <FormControl fullWidth margin="dense">
                    <InputLabel>Parcelas</InputLabel>
                    <Select
                      value={installments}
                      onChange={e => setInstallments(e.target.value)}
                    >
                      {availableInstallments.map(item => (
                        <MenuItem key={item.id} value={item.installments}>
                          {item.installments}x de R${" "}
                          {(paymentAmount / item.installments)
                            .toFixed(2)
                            .replace(".", ",")}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                )}

                {paymentMethod && (
                  <NumberFormat
                    customInput={TextField}
                    fullWidth
                    label="Valor"
                    margin="dense"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    value={paymentAmount}
                    onValueChange={({ floatValue }) => {
                      if (floatValue > valorRestante) {
                        toast.warn(
                          "Valor maior que o restante. Ajustado automaticamente."
                        );
                        setPaymentAmount(valorRestante);
                      } else {
                        setPaymentAmount(floatValue || 0);
                      }
                    }}
                  />
                )}
                {paymentMethod?.typePayment?.change && (
                  <NumberFormat
                    customInput={TextField}
                    fullWidth
                    label="Troco para"
                    margin="dense"
                    thousandSeparator="."
                    decimalSeparator=","
                    prefix="R$ "
                    value={changeValue}
                    onValueChange={({ floatValue }) =>
                      setChangeValue(floatValue || 0)
                    }
                  />
                )}
              </div>
              <Button
                color="primary"
                variant="outlined"
                fullWidth
                onClick={handleAddPayment}
              >
                Adicionar Pagamento
              </Button>
              <TextField
                fullWidth
                label="Cupom de Desconto"
                name="cupom"
                value={form.cupom}
                onChange={e =>
                  setForm(prev => ({ ...prev, cupom: e.target.value }))
                }
                margin="dense"
              />

              <Typography variant="body2" color="textSecondary">
                Cupom exemplo: LOJA10 (10% de desconto)
              </Typography>

              <TableContainer>
                <Table size="small" className={classes.table}>
                  <TableHead>
                    <TableRow>
                      <TableCell>Método</TableCell>
                      <TableCell>Parcelas</TableCell>
                      <TableCell>Valor</TableCell>
                      <TableCell>Troco</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {partialPayments.map((p, idx) => (
                      <TableRow key={idx}>
                        <TableCell>{p.method.name}</TableCell>
                        <TableCell>{p.installments || "-"}</TableCell>
                        <TableCell>
                          R$ {p.value.toFixed(2).replace(".", ",")}
                        </TableCell>
                        <TableCell>
                          {p.method?.typePayment?.change
                            ? `R$ ${p.change.toFixed(2).replace(".", ",")}`
                            : "-"}
                        </TableCell>
                        <TableCell>
                          <IconButton onClick={() => handleRemovePayment(idx)}>
                            <DeleteIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Typography variant="body2" style={{ marginTop: 8 }}>
                Total: R$ {valorFinal.toFixed(2).replace(".", ",")} | Pago: R${" "}
                {somaPagamentos.toFixed(2).replace(".", ",")}
              </Typography>
            </>
          )}

          {activeStep === 2 && (
            <>
              {/* Etapa 3 - Confirmação */}
              <Typography variant="h6">Confirmação do Pedido</Typography>

              <Typography variant="body1">
                <strong>Loja:</strong> {pedido?.storeName || "Não informado"}
              </Typography>
              <Typography variant="body1">
                <strong>Cliente:</strong>{" "}
                {pedido?.customerName || "Não informado"} -{" "}
                {pedido.customerPhone || "Não informado"}
                <br />
                <strong>Email:</strong>{" "}
                {pedido?.customerEmail || "Não informado"}
              </Typography>
              {form.tipoEntrega === "entrega" && (
                <Typography variant="body1">
                  <strong>Endereço de Entrega:</strong> {getEnderecoFormatado()}
                </Typography>
              )}
              <Typography variant="body1" gutterBottom>
                <strong>Itens:</strong>
              </Typography>
              {pedido?.itens?.map((item, idx) => (
                <Typography key={idx} variant="body2">
                  {item.name} - {item.amount} x R$
                  {item.price.toFixed(2).replace(".", ",")}
                </Typography>
              ))}

              <Typography variant="body1">
                <strong>Total:</strong> R$
                {aplicarCupom(total, form.cupom).toFixed(2).replace(".", ",")}
              </Typography>
            </>
          )}
        </div>
      </DialogContent>
      <DialogActions>
        {activeStep === 0 && form.typeDelivery === "entrega" && (
          <Button onClick={hadleEditCustomerAddress}>Novo Endereço</Button>
        )}
        {activeStep > 0 && (
          <Button onClick={() => setActiveStep(prev => prev - 1)}>
            Voltar
          </Button>
        )}
        {activeStep < steps.length - 1 ? (
          <Button
            color="primary"
            variant="contained"
            onClick={() => setActiveStep(prev => prev + 1)}
          >
            Próximo
          </Button>
        ) : (
          <Button color="primary" variant="contained" onClick={handleFinish}>
            Confirmar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default CheckoutStepperModal;
