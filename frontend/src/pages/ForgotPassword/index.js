import React, { useState, useContext } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import ArrowBackIcon from "@material-ui/icons/ArrowBack";
import EmailIcon from "@material-ui/icons/Email";
import { Helmet } from "react-helmet";
import { toast } from "react-toastify";
import ColorModeContext from "../../layout/themeContext";
import { openApi } from "../../services/api";

const useStyles = makeStyles((theme) => ({
    root: {
        width: "100vw",
        height: "100vh",
        display: "flex",
        overflow: "hidden",
    },
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
    },
    themeToggle: {
        position: "absolute",
        top: 20,
        right: 20,
        color: theme.mode === "light" ? "#333" : "#fff",
        backgroundColor: theme.mode === "light" ? "rgba(0,0,0,0.05)" : "rgba(255,255,255,0.1)",
    },
    backButton: {
        position: "absolute",
        top: 20,
        left: 20,
        color: theme.mode === "light" ? "#333" : "#fff",
    },
    formContainer: {
        width: "100%",
        maxWidth: "400px",
    },
    iconContainer: {
        width: "80px",
        height: "80px",
        borderRadius: "50%",
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        margin: "0 auto",
        marginBottom: theme.spacing(3),
    },
    emailIcon: {
        fontSize: "40px",
        color: "#fff",
    },
    welcomeText: {
        fontSize: "1.8rem",
        fontWeight: 600,
        marginBottom: theme.spacing(1),
        color: theme.mode === "light" ? "#333" : "#fff",
    },
    subtitleText: {
        fontSize: "0.95rem",
        color: theme.mode === "light" ? "#666" : "#aaa",
        marginBottom: theme.spacing(4),
    },
    form: {
        width: "100%",
    },
    textField: {
        marginBottom: theme.spacing(2),
        "& .MuiOutlinedInput-root": {
            borderRadius: "10px",
            backgroundColor: theme.mode === "light" ? "#fff" : "rgba(255,255,255,0.05)",
        },
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
    },
    link: {
        color: theme.palette.primary.main,
        textDecoration: "none",
        fontWeight: 500,
    },
    successMessage: {
        textAlign: "center",
        color: theme.palette.success.main,
        marginTop: theme.spacing(2),
    },
}));

const ForgotPassword = () => {
    const classes = useStyles();
    const { colorMode } = useContext(ColorModeContext);
    const { appLogoFavicon, appName, mode } = colorMode;
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            await openApi.post("/auth/forgot-password", { email });
            setSent(true);
            toast.success("Email de recuperação enviado com sucesso!");
        } catch (error) {
            toast.error("Erro ao enviar email. Verifique se o email está correto.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Helmet>
                <title>Recuperar Senha - {appName || "WORKZAP"}</title>
                <link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
            </Helmet>
            <div className={classes.root}>
                <CssBaseline />

                <div className={classes.leftSide}>
                    <div className={classes.leftContent}>
                        <Typography className={classes.leftTitle}>
                            Recuperação de Senha
                        </Typography>
                        <Typography className={classes.leftSubtitle}>
                            Não se preocupe! Acontece com todo mundo.
                            Digite seu email e enviaremos instruções para redefinir sua senha.
                        </Typography>
                    </div>
                </div>

                <div className={classes.rightSide}>
                    <IconButton
                        className={classes.backButton}
                        component={RouterLink}
                        to="/login"
                    >
                        <ArrowBackIcon />
                    </IconButton>

                    <IconButton
                        className={classes.themeToggle}
                        onClick={colorMode.toggleColorMode}
                    >
                        {mode === "dark" ? <Brightness7Icon /> : <Brightness4Icon />}
                    </IconButton>

                    <div className={classes.formContainer}>
                        <div className={classes.iconContainer}>
                            <EmailIcon className={classes.emailIcon} />
                        </div>

                        <Typography className={classes.welcomeText} align="center">
                            Esqueceu a senha?
                        </Typography>
                        <Typography className={classes.subtitleText} align="center">
                            Digite seu email para receber as instruções
                        </Typography>

                        {!sent ? (
                            <form className={classes.form} onSubmit={handleSubmit}>
                                <TextField
                                    className={classes.textField}
                                    variant="outlined"
                                    required
                                    fullWidth
                                    id="email"
                                    label="Email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    autoComplete="email"
                                    autoFocus
                                />

                                <Button
                                    type="submit"
                                    fullWidth
                                    variant="contained"
                                    color="primary"
                                    className={classes.submitButton}
                                    disabled={loading || !email}
                                >
                                    {loading ? "Enviando..." : "Enviar email de recuperação"}
                                </Button>

                                <Box textAlign="center" mt={2}>
                                    <Typography variant="body2" style={{ color: mode === "light" ? "#666" : "#aaa" }}>
                                        Lembrou da senha?{" "}
                                        <Link
                                            component={RouterLink}
                                            to="/login"
                                            className={classes.link}
                                        >
                                            Voltar ao login
                                        </Link>
                                    </Typography>
                                </Box>
                            </form>
                        ) : (
                            <Box textAlign="center">
                                <Typography className={classes.successMessage}>
                                    ✓ Email enviado com sucesso!
                                </Typography>
                                <Typography variant="body2" style={{ color: mode === "light" ? "#666" : "#aaa", marginTop: 16 }}>
                                    Verifique sua caixa de entrada e siga as instruções.
                                </Typography>
                                <Box mt={3}>
                                    <Link
                                        component={RouterLink}
                                        to="/login"
                                        className={classes.link}
                                    >
                                        Voltar ao login
                                    </Link>
                                </Box>
                            </Box>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default ForgotPassword;
