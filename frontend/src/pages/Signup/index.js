import React, { useState, useEffect, useContext } from "react";
import qs from 'query-string'

import * as Yup from "yup";
import { useHistory } from "react-router-dom";
import { Link as RouterLink } from "react-router-dom";
import { toast } from "react-toastify";
import { Formik, Form, Field } from "formik";

import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import PersonAddIcon from "@material-ui/icons/PersonAdd";
import { InputLabel, MenuItem, Select } from "@material-ui/core";
import { Helmet } from "react-helmet";

import usePlans from '../../hooks/usePlans';
import { i18n } from "../../translate/i18n";
import { openApi } from "../../services/api";
import toastError from "../../errors/toastError";
import ColorModeContext from "../../layout/themeContext";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
    },
    // Lado esquerdo - Banner
    leftSide: {
        flex: 1,
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(4),
        position: "relative",
        overflow: "hidden",
        [theme.breakpoints.down("sm")]: {
            display: "none",
        },
    },
    leftContent: {
        zIndex: 1,
        textAlign: "center",
        color: "#fff",
    },
    leftTitle: {
        fontSize: "2.5rem",
        fontWeight: 700,
        marginBottom: theme.spacing(2),
        textShadow: "2px 2px 4px rgba(0,0,0,0.3)",
    },
    leftSubtitle: {
        fontSize: "1.1rem",
        opacity: 0.9,
        maxWidth: "400px",
        lineHeight: 1.6,
    },
    // Lado direito - Formulário
    rightSide: {
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: theme.spacing(4),
        background: theme.mode === "light"
            ? "linear-gradient(180deg, #f8f9fa 0%, #e9ecef 100%)"
            : "linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)",
        position: "relative",
        overflowY: "auto",
    },
    themeToggle: {
        position: "absolute",
        top: 20,
        right: 20,
        color: theme.mode === "light" ? "#333" : "#fff",
        backgroundColor: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
        "&:hover": {
            backgroundColor: theme.mode === "light" ? "rgba(0,0,0,0.1)" : "rgba(255,255,255,0.2)",
        }
    },
    formContainer: {
        width: "100%",
        maxWidth: "450px",
        padding: theme.spacing(2),
    },
    iconContainer: {
        width: "70px",
        height: "70px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        marginBottom: theme.spacing(2),
    },
    personIcon: {
        fontSize: "35px",
        color: "#fff",
    },
    welcomeText: {
        fontSize: "1.6rem",
        fontWeight: 600,
        marginBottom: theme.spacing(0.5),
        color: theme.mode === "light" ? "#333" : "#fff",
    },
    subtitleText: {
        fontSize: "0.9rem",
        color: theme.mode === "light" ? "#666" : "#aaa",
        marginBottom: theme.spacing(3),
    },
    form: {
        width: "100%",
    },
    textField: {
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: theme.mode === "light" ? "#fff" : "rgba(255,255,255,0.05)",
            "&:hover fieldset": {
                borderColor: theme.palette.primary.main,
            },
        },
        "& .MuiInputLabel-root": {
            color: theme.mode === "light" ? "#666" : "#aaa",
        },
    },
    selectField: {
        borderRadius: "10px",
        backgroundColor: theme.mode === "light" ? "#fff" : "rgba(255,255,255,0.05)",
    },
    submitButton: {
        marginTop: theme.spacing(2),
        marginBottom: theme.spacing(2),
        padding: theme.spacing(1.5),
        borderRadius: "10px",
        fontSize: "1rem",
        fontWeight: 600,
        textTransform: "none",
        boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        "&:hover": {
            boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
        }
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: "none",
        fontWeight: 500,
        "&:hover": {
            textDecoration: "underline",
        }
    },
    inputLabel: {
        color: theme.mode === "light" ? "#666" : "#aaa",
        marginBottom: theme.spacing(0.5),
        fontSize: "0.875rem",
    },
}));

const UserSchema = Yup.object().shape({
    name: Yup.string()
        .min(2, "Muito curto!")
        .max(50, "Muito longo!")
        .required("Obrigatório"),
    companyName: Yup.string()
        .min(2, "Muito curto!")
        .max(50, "Muito longo!")
        .required("Obrigatório"),
    password: Yup.string().min(5, "Mínimo 5 caracteres").max(50, "Muito longo!"),
    email: Yup.string().email("Email inválido").required("Obrigatório"),
    phone: Yup.string().required("Obrigatório"),
});

const SignUp = () => {
    const classes = useStyles();
    const history = useHistory();
    const { colorMode } = useContext(ColorModeContext);
    const { appLogoFavicon, appName, mode } = colorMode;
    const { getPlanList } = usePlans()
    const [plans, setPlans] = useState([])
    const [loading, setLoading] = useState(false);

    let companyId = null
    const params = qs.parse(window.location.search)
    if (params.companyId !== undefined) {
        companyId = params.companyId
    }

    const initialState = { name: "", email: "", password: "", phone: "", companyId, companyName: "", planId: "" };

    const [user] = useState(initialState);

    useEffect(() => {
        setLoading(true);
        const fetchData = async () => {
            const planList = await getPlanList({ listPublic: "false" });
            setPlans(planList);
            setLoading(false);
        }
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleSignUp = async values => {
        try {
            await openApi.post("/auth/signup", values);
            toast.success(i18n.t("signup.toasts.success"));
            history.push("/login");
        } catch (err) {
            toastError(err);
        }
    };

    return (
        <>
            <Helmet>
                <title>Criar Conta - {appName || "WORKZAP"}</title>
                <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
            </Helmet>
            <div className={classes.root}>
                <CssBaseline />

                {/* Lado Esquerdo - Banner */}
                <div className={classes.leftSide}>
                    <div className={classes.leftContent}>
                        <Typography className={classes.leftTitle}>
                            Junte-se a nós!
                        </Typography>
                        <Typography className={classes.leftSubtitle}>
                            Crie sua conta e comece a gerenciar suas conversas
                            de WhatsApp, Facebook e Instagram em um único lugar.
                            Experimente agora mesmo!
                        </Typography>
                    </div>
                </div>

                {/* Lado Direito - Formulário */}
                <div className={classes.rightSide}>
                    <IconButton
                        className={classes.themeToggle}
                        onClick={colorMode.toggleColorMode}
                        size="medium"
                    >
                        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <div className={classes.formContainer}>
                        <div className={classes.iconContainer}>
                            <PersonAddIcon className={classes.personIcon} />
                        </div>

                        <Typography className={classes.welcomeText} align="center">
                            {i18n.t("signup.title")}
                        </Typography>
                        <Typography className={classes.subtitleText} align="center">
                            Preencha os dados para criar sua conta
                        </Typography>

                        <Formik
                            initialValues={user}
                            enableReinitialize={true}
                            validationSchema={UserSchema}
                            onSubmit={(values, actions) => {
                                setTimeout(() => {
                                    handleSignUp(values);
                                    actions.setSubmitting(false);
                                }, 400);
                            }}
                        >
                            {({ touched, errors, isSubmitting }) => (
                                <Form className={classes.form}>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                className={classes.textField}
                                                variant="outlined"
                                                fullWidth
                                                id="companyName"
                                                label={i18n.t("signup.form.company")}
                                                error={touched.companyName && Boolean(errors.companyName)}
                                                helperText={touched.companyName && errors.companyName}
                                                name="companyName"
                                                autoComplete="companyName"
                                                autoFocus
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                className={classes.textField}
                                                autoComplete="name"
                                                name="name"
                                                error={touched.name && Boolean(errors.name)}
                                                helperText={touched.name && errors.name}
                                                variant="outlined"
                                                fullWidth
                                                id="name"
                                                label={i18n.t("signup.form.name")}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                className={classes.textField}
                                                variant="outlined"
                                                fullWidth
                                                id="email"
                                                label={i18n.t("signup.form.email")}
                                                name="email"
                                                error={touched.email && Boolean(errors.email)}
                                                helperText={touched.email && errors.email}
                                                autoComplete="email"
                                                inputProps={{ style: { textTransform: 'lowercase' } }}
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                className={classes.textField}
                                                variant="outlined"
                                                fullWidth
                                                name="password"
                                                error={touched.password && Boolean(errors.password)}
                                                helperText={touched.password && errors.password}
                                                label={i18n.t("signup.form.password")}
                                                type="password"
                                                id="password"
                                                autoComplete="new-password"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <Field
                                                as={TextField}
                                                className={classes.textField}
                                                variant="outlined"
                                                fullWidth
                                                id="phone"
                                                label={i18n.t("signup.form.phone")}
                                                name="phone"
                                                autoComplete="phone"
                                            />
                                        </Grid>

                                        <Grid item xs={12}>
                                            <InputLabel className={classes.inputLabel} htmlFor="plan-selection">
                                                Selecione um Plano
                                            </InputLabel>
                                            <Field
                                                as={Select}
                                                className={classes.selectField}
                                                variant="outlined"
                                                fullWidth
                                                id="plan-selection"
                                                name="planId"
                                                required
                                            >
                                                {plans.map((plan, key) => (
                                                    <MenuItem key={key} value={plan.id}>
                                                        {plan.name} - {plan.users} usuários - {plan.connections} conexões - R$ {plan.amount}
                                                    </MenuItem>
                                                ))}
                                            </Field>
                                        </Grid>
                                    </Grid>

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className={classes.submitButton}
                                        disabled={isSubmitting}
                                    >
                                        {isSubmitting ? "Criando conta..." : i18n.t("signup.buttons.submit")}
                                    </Button>

                                    <Box textAlign="center">
                                        <Typography variant="body2" style={{ color: mode === "light" ? "#666" : "#aaa" }}>
                                            Já tem uma conta?{" "}
                                            <Link
                                                component={RouterLink}
                                                to="/login"
                                                className={classes.link}
                                            >
                                                Fazer login
                                            </Link>
                                        </Typography>
                                    </Box>
                                </Form>
                            )}
                        </Formik>
                    </div>
                </div>
            </div>
        </>
    );
};

export default SignUp;
