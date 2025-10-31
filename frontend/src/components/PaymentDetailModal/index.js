// src/components/PaymentDetailModal.js

import React, { useState, useEffect } from "react";
import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  CircularProgress,
  Paper,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  IconButton,
  TextField
} from "@material-ui/core";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import { i18n } from "../../translate/i18n";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import TableRowSkeleton from "../TableRowSkeleton";
import EditIcon from "@material-ui/icons/Edit";

import { toast } from "react-toastify";
import NumberFormat from "react-number-format";

const useStyles = makeStyles(theme => ({
  root: { display: "flex", flexWrap: "wrap" },
  btnWrapper: { position: "relative" },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  tabPanelsContainer: {
    padding: theme.spacing(2)
  }
}));

const paymentDetailSchema = Yup.object().shape({
  minimumValue: Yup.string().required("valor inicial é obrigatório"),
  installments: Yup.string().required("Parcela é obrigatório")
});

const CurrencyInput = ({ field, form, ...props }) => (
  <NumberFormat
    {...field}
    {...props}
    thousandSeparator={"."}
    decimalSeparator={","}
    prefix={"R$ "}
    decimalScale={2}
    fixedDecimalScale
    customInput={TextField}
  />
);

const PaymentDetailModal = ({ open, onClose, paymentId }) => {
  const classes = useStyles();
  const [paymentDetails, setPaymentDetails] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);

  const removeMask = value => {
    return value.replace(/[^0-9,]/g, "").replace(",", ".");
  };

  const initialState = {
    minimumValue: "",
    installments: ""
  };

  const [paymentDetail, setPaymentDetail] = useState(initialState);

  useEffect(() => {
    if (!paymentId) return;
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/paymentDetails/all/${paymentId}`);
        setPaymentDetails(data.paymentDetails);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
    setPaymentDetail(initialState);
  }, [paymentId, open]);

  const handleClose = () => {
    setPaymentDetails([]);
    onClose();
  };

  const handleEditPaymentDetails = async paymentDetailId => {
    try {
      const { data } = await api.get(`/paymentDetails/${paymentDetailId}`);
      data.minimumValue = Number(data.minimumValue);
      setPaymentDetail(data);
      setEditingId(paymentDetailId);
    } catch (err) {
      toastError(err);
    }
  };

  const handleDeleteContactAddress = async paymentDetailId => {
    try {
      await api.delete(`/paymentDetails/${paymentDetailId}`);
      toast.success(i18n.t("paymentDetails.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    const fetchPaymentDetails = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/paymentDetails/all/${paymentId}`);

        setPaymentDetails(data.paymentDetails);
      } catch (err) {
        toastError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPaymentDetails();
    setPaymentDetail(initialState);
  };

  const handleSubmit = async (values, actions) => {
    try {
      if (editingId) {
        values.minimumValue = removeMask(String(values.minimumValue));
        values.paymentDetailId = editingId;
        await api.put(`/paymentDetails/${editingId}`, values);
        toast.success("Parcela atualizado com sucesso!");
      } else {
        values.minimumValue = removeMask(String(values.minimumValue));
        values.paymentId = paymentId;
        await api.post("/paymentDetails", values);
        toast.success("Detalhe do pagamento adicionado com sucesso!");
      }

      const fetchPaymentDetails = async () => {
        setLoading(true);
        try {
          const { data } = await api.get(`/paymentDetails/all/${paymentId}`);
          setPaymentDetails(data.paymentDetails);
        } catch (err) {
          toastError(err);
        } finally {
          setLoading(false);
        }
      };

      setEditingId(null);
      setPaymentDetail(initialState);
      actions.resetForm();
      fetchPaymentDetails();
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Parcelamento de pagamento</DialogTitle>
      <Formik
        enableReinitialize
        initialValues={paymentDetail}
        validationSchema={paymentDetailSchema}
        onSubmit={handleSubmit}
      >
        {({ touched, errors, isSubmitting, values, setFieldValue }) => (
          <Form>
            <DialogContent dividers>
              <div className={classes.multFieldLine}>
                <Field
                  as={TextField}
                  label={i18n.t("paymentDetailModal.form.minimumValue")}
                  name="minimumValue"
                  component={CurrencyInput}
                  error={touched.minimumValue && Boolean(errors.minimumValue)}
                  helperText={touched.minimumValue && errors.minimumValue}
                  variant="outlined"
                  margin="dense"
                  className={classes.textField}
                  fullWidth
                />

                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* <Button
                  variant="outlined"
                  onClick={() =>
                    setFieldValue(
                      "installments",
                      Math.max(1, Number(values.installments || 1) - 1)
                    )
                  }
                >
                  -
                </Button> */}
                  <TextField
                    label={i18n.t("paymentDetailModal.form.installments")}
                    name="installments"
                    type="text"
                    value={values.installments}
                    onChange={e => {
                      setFieldValue("installments", e.target.value);
                    }}
                    error={touched.installments && Boolean(errors.installments)}
                    helperText={touched.installments && errors.installments}
                    variant="outlined"
                    margin="dense"
                    className={classes.textField}
                    inputProps={{ min: 1 }}
                    fullWidth
                    onKeyPress={event => {
                      if (!/[0-9]/.test(event.key)) {
                        event.preventDefault();
                      }
                    }}
                  />
                  {/* <Button
                  variant="outlined"
                  onClick={() =>
                    setFieldValue(
                      "installments",
                      Number(values.installments || 1) + 1
                    )
                  }
                >
                  +
                </Button> */}
                </div>
              </div>
            </DialogContent>
            <DialogContent>
              <Paper variant="outlined">
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>
                        {i18n.t("paymentDetails.table.minimumValue")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("paymentDetails.table.installments")}
                      </TableCell>
                      <TableCell>
                        {i18n.t("paymentDetails.table.actions")}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {loading ? (
                      <TableRowSkeleton columns={2} />
                    ) : (
                      paymentDetails.map(paymentDetails => (
                        <TableRow key={paymentDetails.id}>
                          <TableCell>{paymentDetails.minimumValue}</TableCell>
                          <TableCell>{paymentDetails.installments}</TableCell>
                          <TableCell>
                            <IconButton
                              size="small"
                              onClick={() =>
                                handleEditPaymentDetails(paymentDetails.id)
                              }
                            >
                              <EditIcon />
                            </IconButton>
                            <IconButton
                              size="small"
                              onClick={e =>
                                handleDeleteContactAddress(paymentDetails.id)
                              }
                            >
                              <DeleteOutlineIcon />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </Paper>
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="outlined"
              >
                Fechar
              </Button>
              <Button
                type="submit"
                color="primary"
                variant="contained"
                className={classes.btnWrapper}
              >
                {paymentDetails.id ? "Atualizar" : "Adicionar"}
                {isSubmitting && (
                  <CircularProgress
                    size={24}
                    className={classes.buttonProgress}
                  />
                )}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
};

export default PaymentDetailModal;
