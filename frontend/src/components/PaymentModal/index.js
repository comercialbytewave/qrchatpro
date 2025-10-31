/* eslint-disable react-hooks/exhaustive-deps */
import React, { useState, useEffect, useContext } from "react";

import * as Yup from "yup";
import { Formik, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { FormControl, InputLabel, MenuItem, Select } from "@material-ui/core";
import useTypePayments from "../../hooks/useTypePayments";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1)
    }
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120
  },
  colorAdorment: {
    width: 20,
    height: 20
  },
  selectContainer: {
    width: "100%",
    textAlign: "left"
  }
}));

const TagSchema = Yup.object().shape({
  code: Yup.string()
    .optional()
    .nullable()
    .transform(value => (!value ? null : value)),
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório")
});

const PaymentModal = ({ open, onClose, paymentId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [typePayments, setTypePayments] = useState([]);
  const { list: listTypePayments } = useTypePayments();

  const initialState = {
    code: "",
    name: "",
    typePaymentId: ""
  };

  const [payment, setPayment] = useState(initialState);

  useEffect(() => {
    try {
      (async () => {
        if (!paymentId) return;

        const { data } = await api.get(`/payments/${paymentId}`);
        setPayment(prevState => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [paymentId, open]);

  useEffect(() => {
    const fetchTypePayment = async () => {
      try {
        const list = await listTypePayments();
        setTypePayments(list);
      } catch (err) {
        toastError(err);
      }
    };
    fetchTypePayment();
  }, []);

  const handleClose = () => {
    setPayment(initialState);
    onClose();
  };

  const handleSavePayment = async values => {
    const paymentData = { ...values, userId: user.id };

    try {
      if (paymentId) {
        await api.put(`/payments/${paymentId}`, paymentData);
      } else {
        await api.post("/payments", paymentData);
      }
      toast.success(`${i18n.t("paymentModal.success")}`);
      if (typeof reload == "function") {
        reload();
      }
    } catch (err) {
      toastError(err);
    }
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="xs"
        fullWidth
        scroll="paper"
      >
        <DialogTitle id="form-dialog-title">
          {paymentId
            ? `${i18n.t("paymentModal.title.edit")}`
            : `${i18n.t("paymentModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={payment}
          enableReinitialize={true}
          validationSchema={TagSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSavePayment(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
                
                  <Field
                    as={TextField}
                    label={i18n.t("paymentModal.form.code")}
                    name="code"
                    error={touched.code && Boolean(errors.code)}
                    helperText={touched.code && errors.code}
                    variant="outlined"
                    margin="dense"
                    onChange={e =>
                      setPayment(prev => ({ ...prev, code: e.target.value }))
                    }
                    fullWidth
                  />
                  <Field
                    as={TextField}
                    label={i18n.t("paymentModal.form.name")}
                    name="name"
                    error={touched.name && Boolean(errors.name)}
                    helperText={touched.name && errors.name}
                    variant="outlined"
                    margin="dense"
                    onChange={e =>
                      setPayment(prev => ({ ...prev, name: e.target.value }))
                    }
                    fullWidth
                  />
                
                <FormControl className={classes.selectContainer}>
                  <InputLabel id="ratings-label">Tipo Pagamento</InputLabel>
                  <Select
                    labelId="type-label"
                    value={values.typePaymentId}
                    onChange={async e => {
                      setPayment(prev => ({
                        ...prev,
                        typePaymentId: e.target.value
                      }));
                    }}
                  >
                    {typePayments.map(typePayment => {
                      return (
                        <MenuItem key={typePayment.id} value={typePayment.id}>
                          {typePayment.code}
                        </MenuItem>
                      );
                    })}
                  </Select>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("paymentModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {paymentId
                    ? `${i18n.t("paymentModal.buttons.okEdit")}`
                    : `${i18n.t("paymentModal.buttons.okAdd")}`}
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
    </div>
  );
};

export default PaymentModal;
