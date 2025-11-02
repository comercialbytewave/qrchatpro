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
  }
}));

const SatusBudGetSchema = Yup.object().shape({
  name: Yup.string().min(3, "Mensagem muito curta").required("Obrigatório"),
  code: Yup.string()
    .optional()
    .nullable()
    .transform(value => (!value ? null : value))
});

const StatusBudGetModal = ({ open, onClose, statusBudgetId, reload }) => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const initialState = {
    name: "",
    code: ""
  };

  const [statusBudGet, setStatusBudGet] = useState(initialState);

  useEffect(() => {
    try {
      (async () => {
        if (!statusBudgetId) return;

        const { data } = await api.get(`/statusBudGets/${statusBudgetId}`);
        setStatusBudGet(prevState => {
          return { ...prevState, ...data };
        });
      })();
    } catch (err) {
      toastError(err);
    }
  }, [statusBudgetId, open]);

  const handleClose = () => {
    setStatusBudGet(initialState);
    onClose();
  };

  const handleSaveStatusBudGet = async values => {
    const statusBudGetData = { ...values, userId: user.id };

    try {
      if (statusBudgetId) {
        await api.put(`/statusBudgets/${statusBudgetId}`, statusBudGetData);
      } else {
        await api.post("/statusBudgets", statusBudGetData);
      }
      toast.success(`${i18n.t("statusBudGetModal.success")}`);
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
          {statusBudgetId
            ? `${i18n.t("statusBudGetModal.title.edit")}`
            : `${i18n.t("statusBudGetModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={statusBudGet}
          enableReinitialize={true}
          validationSchema={SatusBudGetSchema}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSaveStatusBudGet(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form>
              <DialogContent dividers>
			  <Field
                  as={TextField}
                  label={i18n.t("statusBudGetModal.form.code")}
                  name="code"
                  error={touched.code && Boolean(errors.code)}
                  helperText={touched.code && errors.code}
                  variant="outlined"
                  margin="dense"
                  onChange={e =>
                    setStatusBudGet(prev => ({ ...prev, code: e.target.value }))
                  }
                  fullWidth
                />
                <Field
                  as={TextField}
                  label={i18n.t("statusBudGetModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  onChange={e =>
                    setStatusBudGet(prev => ({ ...prev, name: e.target.value }))
                  }
                  fullWidth
                />
                
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("statusBudGetModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {statusBudgetId
                    ? `${i18n.t("statusBudGetModal.buttons.okEdit")}`
                    : `${i18n.t("statusBudGetModal.buttons.okAdd")}`}
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

export default StatusBudGetModal;
