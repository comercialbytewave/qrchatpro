import React, { useState, useEffect } from "react";

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
import { MenuItem, FormControl, InputLabel, Select } from "@material-ui/core";
import { Visibility, VisibilityOff } from "@material-ui/icons";
import { InputAdornment, IconButton } from "@material-ui/core";
import QueueSelectSingle from "../QueueSelectSingle";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  multFieldLine: {
    display: "flex",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },

  btnWrapper: {
    position: "relative",
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
  colorAdorment: {
    width: 20,
    height: 20,
  },
}));

const PromptSchema = Yup.object().shape({
  name: Yup.string()
    .min(5, "Muito curto!")
    .max(100, "Muito longo!")
    .required("Obrigatório"),
  userId: Yup.number().required("Informe o vendedor"),
});

const PortifolioModal = ({ open, onClose, portifolioId }) => {
  const classes = useStyles();

  const [users, setUsers] = useState([]);

  const initialState = {
    name: "",
    userId: null,
  };

  const [portifolio, setPortifolio] = useState(initialState);

  useEffect(() => {
    const fetchPortifolio = async () => {
      if (!portifolioId) {
        setPortifolio(initialState);
        return;
      }
      try {
        const { data } = await api.get(`/portifolios/${portifolioId}`);
        setPortifolio((prevState) => {
          return { ...prevState, ...data };
        });
      } catch (err) {
        toastError(err);
      }
    };

    fetchPortifolio();
  }, [portifolioId, open]);

  useEffect(() => {
    async function fetchData() {
      //const list = await listUsers();
      const { data } = await api.get(`/users`);

      console.log(data);
      setUsers(data.users);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleClose = () => {
    setPortifolio(initialState);
    onClose();
  };

  const handleSavePortifolio = async (values) => {
    const portifolioData = { ...values };
    if (!portifolioData.userId) {
      toastError("Informe o vendedor");
      return;
    }
    try {
      if (portifolioId) {
        await api.put(`/portifolios/${portifolioId}`, portifolioData);
      } else {
        await api.post("/portifolios", portifolioData);
      }
      toast.success(i18n.t("portifolioModal.success"));
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
        maxWidth="md"
        scroll="paper"
        fullWidth
      >
        <DialogTitle id="form-dialog-title">
          {portifolioId
            ? `${i18n.t("portifolioModal.title.edit")}`
            : `${i18n.t("portifolioModal.title.add")}`}
        </DialogTitle>
        <Formik
          initialValues={portifolio}
          enableReinitialize={true}
          onSubmit={(values, actions) => {
            setTimeout(() => {
              handleSavePortifolio(values);
              actions.setSubmitting(false);
            }, 400);
          }}
        >
          {({ touched, errors, isSubmitting, values }) => (
            <Form style={{ width: "100%" }}>
              <DialogContent dividers>
                <Field
                  as={TextField}
                  label={i18n.t("portifolioModal.form.name")}
                  name="name"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                  variant="outlined"
                  margin="dense"
                  onChange={(e) =>
                    setPortifolio((prev) => ({ ...prev, name: e.target.value }))
                  }
                  fullWidth
                />
                <FormControl margin="dense" variant="outlined" fullWidth>
                  <InputLabel htmlFor="user-selection">Vendedor</InputLabel>
                  <Field
                    as={Select}
                    id="user-selection"
                    label="Vendedor"
                    labelId="user-selection-label"
                    name="userId"
                    margin="dense"
                    required
                    fullWidth
                  >
                    {users.map((user, key) => (
                      <MenuItem key={key} value={user.id}>
                        {user.name}
                      </MenuItem>
                    ))}
                  </Field>
                </FormControl>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  disabled={isSubmitting}
                  variant="outlined"
                >
                  {i18n.t("portifolioModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  disabled={isSubmitting}
                  variant="contained"
                  className={classes.btnWrapper}
                >
                  {portifolioId
                    ? `${i18n.t("portifolioModal.buttons.okEdit")}`
                    : `${i18n.t("portifolioModal.buttons.okAdd")}`}
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

export default PortifolioModal;
