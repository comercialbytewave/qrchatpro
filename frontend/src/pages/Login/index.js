import React, { useState, useContext, useEffect } from "react";
import { Link as RouterLink } from "react-router-dom";
import Button from "@material-ui/core/Button";
import CssBaseline from "@material-ui/core/CssBaseline";
import TextField from "@material-ui/core/TextField";
import Link from "@material-ui/core/Link";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import Typography from "@material-ui/core/Typography";
import { makeStyles } from "@material-ui/core/styles";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import ColorModeContext from "../../layout/themeContext";
import useSettings from "../../hooks/useSettings";
import IconButton from "@material-ui/core/IconButton";
import Brightness4Icon from "@material-ui/icons/Brightness4";
import Brightness7Icon from "@material-ui/icons/Brightness7";
import { Helmet } from "react-helmet";

const useStyles = makeStyles((theme) => ({
	root: {
		width: "100vw",
		height: "100vh",
		display: "flex",
		overflow: "hidden",
	},
	// Lado esquerdo - Imagem/Banner
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
		"&::before": {
			content: '""',
			position: "absolute",
			top: 0,
			left: 0,
			right: 0,
			bottom: 0,
			background: "url('/logo.png') center center no-repeat",
			backgroundSize: "contain",
			opacity: 0.1,
		}
	},
	leftContent: {
		zIndex: 1,
		textAlign: "center",
		color: "#fff",
	},
	leftLogo: {
		width: "200px",
		height: "auto",
		marginBottom: theme.spacing(4),
		filter: "brightness(0) invert(1)",
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
		maxWidth: "400px",
	},
	logoImg: {
		width: "180px",
		height: "auto",
		marginBottom: theme.spacing(3),
		content: "url(" + (theme.mode === "light" ? theme.calculatedLogoLight() : theme.calculatedLogoDark()) + ")",
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
			"&:hover fieldset": {
				borderColor: theme.palette.primary.main,
			},
		},
		"& .MuiInputLabel-root": {
			color: theme.mode === "light" ? "#666" : "#aaa",
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
		"&:hover": {
			boxShadow: "0 6px 20px rgba(0,0,0,0.3)",
		}
	},
	linksContainer: {
		marginTop: theme.spacing(2),
	},
	link: {
		color: theme.palette.primary.main,
		textDecoration: "none",
		fontWeight: 500,
		"&:hover": {
			textDecoration: "underline",
		}
	},
	divider: {
		color: theme.mode === "light" ? "#999" : "#666",
		margin: "0 8px",
	},
	forgotPassword: {
		textAlign: "right",
		marginTop: theme.spacing(1),
		marginBottom: theme.spacing(1),
	},
}));

const Login = () => {
	const classes = useStyles();
	const { colorMode } = useContext(ColorModeContext);
	const { appLogoFavicon, appName, mode } = colorMode;
	const [user, setUser] = useState({ email: "", password: "" });
	const [allowSignup, setAllowSignup] = useState(false);
	const { getPublicSetting } = useSettings();
	const { handleLogin } = useContext(AuthContext);

	const handleChangeInput = (e) => {
		setUser({ ...user, [e.target.name]: e.target.value });
	};

	const handlSubmit = (e) => {
		e.preventDefault();
		handleLogin(user);
	};

	useEffect(() => {
		getPublicSetting("allowSignup")
			.then((data) => {
				setAllowSignup(data === "enabled");
			})
			.catch((error) => {
				console.log("Error reading setting", error);
			});
	}, []);

	return (
		<>
			<Helmet>
				<title>{appName || "WORKZAP"}</title>
				<link rel="icon" href={appLogoFavicon || "/default-favicon.ico"} />
			</Helmet>
			<div className={classes.root}>
				<CssBaseline />

				{/* Lado Esquerdo - Banner */}
				<div className={classes.leftSide}>
					<div className={classes.leftContent}>
						<Typography className={classes.leftTitle}>
							Bem-vindo ao {appName || "QRChat"}
						</Typography>
						<Typography className={classes.leftSubtitle}>
							Gerencie suas conversas de WhatsApp, Facebook e Instagram em um único lugar.
							Aumente sua produtividade e melhore o atendimento ao cliente.
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
						<Box display="flex" justifyContent="center">
							<img className={classes.logoImg} alt="logo" />
						</Box>

						<Typography className={classes.welcomeText} align="center">
							Entrar na sua conta
						</Typography>
						<Typography className={classes.subtitleText} align="center">
							Digite suas credenciais para acessar
						</Typography>

						<form className={classes.form} noValidate onSubmit={handlSubmit}>
							<TextField
								className={classes.textField}
								variant="outlined"
								required
								fullWidth
								id="email"
								label={i18n.t("login.form.email")}
								name="email"
								value={user.email}
								onChange={handleChangeInput}
								autoComplete="email"
								autoFocus
							/>
							<TextField
								className={classes.textField}
								variant="outlined"
								required
								fullWidth
								name="password"
								label={i18n.t("login.form.password")}
								type="password"
								id="password"
								value={user.password}
								onChange={handleChangeInput}
								autoComplete="current-password"
							/>

							<div className={classes.forgotPassword}>
								<Link
									component={RouterLink}
									to="/forgot-password"
									className={classes.link}
									variant="body2"
								>
									Esqueceu a senha?
								</Link>
							</div>

							<Button
								type="submit"
								fullWidth
								variant="contained"
								color="primary"
								className={classes.submitButton}
							>
								{i18n.t("login.buttons.submit")}
							</Button>

							<Box className={classes.linksContainer} textAlign="center">
								{allowSignup && (
									<>
										<Typography variant="body2" style={{ color: mode === "light" ? "#666" : "#aaa" }}>
											Não tem uma conta?{" "}
											<Link
												component={RouterLink}
												to="/signup"
												className={classes.link}
											>
												Registre-se
											</Link>
										</Typography>
									</>
								)}
							</Box>
						</form>
					</div>
				</div>
			</div>
		</>
	);
};

export default Login;
