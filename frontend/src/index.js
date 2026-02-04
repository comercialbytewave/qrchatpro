import React from "react";
import ReactDOM from "react-dom";
import CssBaseline from "@material-ui/core/CssBaseline";
import * as serviceworker from './serviceWorker'

import App from "./App";

ReactDOM.render(
	<CssBaseline>
		<App />
	</CssBaseline>,
	document.getElementById("root"),
	() => {
		window.finishProgress();
	}
);

// Registrar o service worker de limpeza que vai:
// 1. Substituir qualquer SW antigo/corrompido
// 2. Limpar todos os caches
// 3. Se auto-desregistrar
serviceworker.register();