import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
    root: {
        display: "flex",
        flexWrap: "wrap"
    },
    textField: {
        marginRight: theme.spacing(1),
        flex: 1
    },

    extraAttr: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
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
    }
}));

const FlowBuilderAddTypebotModal = ({ open, onSave, onUpdate, data, close }) => {
    const classes = useStyles();
    const isMounted = useRef(true);

    const [activeModal, setActiveModal] = useState(false);

    const [labels, setLabels] = useState({
        title: "Adicionar pergunta ao fluxo",
        btn: "Adicionar"
    });

    const [messageDig, setMessageDig] = useState();
    const [keyDig, setKeyDig] = useState();

    useEffect(() => {
        if (open === "edit") {
            setLabels({
                title: "Editar pergunta ao fluxo",
                btn: "Salvar"
            });
            setMessageDig(data.data.message);
            setKeyDig(data.data.key);
            setActiveModal(true);
        } else if (open === "create") {
            setLabels({
                title: "Adicionar pergunta ao fluxo",
                btn: "Adicionar"
            });
            setMessageDig("");
            setKeyDig("");
            setActiveModal(true);
        } else {
            setActiveModal(false);
        }
    }, [open]);

    useEffect(() => {
        return () => {
            isMounted.current = false;
        };
    }, []);

    const handleClose = () => {
        close(null)
        setActiveModal(false);
    };

    const handleSaveContact = async () => {
        if (open === "edit") {
            handleClose();
            onUpdate({
                ...data,
                data: { message: messageDig, key: keyDig }
            });
            return;
        } else if (open === "create") {
            handleClose();
            onSave({
                message: messageDig,
                key: keyDig
            });
        }
    };

    return (
        <div className={classes.root}>
            <Dialog
                open={activeModal}
                onClose={handleClose}
                fullWidth="md"
                scroll="paper"
            >
                <DialogTitle id="form-dialog-title">{labels.title}</DialogTitle>
                <Stack>
                    <DialogContent dividers>
                        <TextField
                            label={"Pergunta"}
                            multiline
                            rows={5}
                            name="message"
                            variant="outlined"
                            value={messageDig}
                            margin="dense"
                            onChange={e => setMessageDig(e.target.value)}
                            className={classes.textField}
                            style={{ width: "95%" }}
                        />
                        <TextField
                            label={"Nome da Variável (Ex: nome, email)"}
                            name="key"
                            variant="outlined"
                            value={keyDig}
                            margin="dense"
                            onChange={e => setKeyDig(e.target.value)}
                            className={classes.textField}
                            style={{ width: "95%", marginTop: "15px" }}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleClose} color="secondary" variant="outlined">
                            {i18n.t("contactModal.buttons.cancel")}
                        </Button>
                        <Button
                            type="submit"
                            color="primary"
                            variant="contained"
                            className={classes.btnWrapper}
                            onClick={() => handleSaveContact()}
                        >
                            {`${labels.btn}`}
                        </Button>
                    </DialogActions>
                </Stack>
            </Dialog>
        </div>
    );
};

export default FlowBuilderAddTypebotModal;
