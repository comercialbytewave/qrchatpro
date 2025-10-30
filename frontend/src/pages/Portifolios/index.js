import React, { useContext, useEffect, useReducer, useState } from "react";

import {
  Button,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from "@material-ui/core";

import { makeStyles } from "@material-ui/core/styles";

import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import Title from "../../components/Title";
import { i18n } from "../../translate/i18n";
import toastError from "../../errors/toastError";
import api from "../../services/api";
import { DeleteOutline, Edit } from "@material-ui/icons";
import PortifolioModal from "../../components/PortifolioModal";
import { toast } from "react-toastify";
import ConfirmationModal from "../../components/ConfirmationModal";
import { AuthContext } from "../../context/Auth/AuthContext";
import usePlans from "../../hooks/usePlans";
import { useHistory } from "react-router-dom/cjs/react-router-dom.min";

// import { SocketContext } from "../../context/Socket/SocketContext";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  customTableCell: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_PORTIFOLIOS") {
    const portifolios = action.payload;
    const newPortifolios = [];

    portifolios.forEach((portifolios) => {
      const portifoliotIndex = state.findIndex((p) => p.id === portifolios.id);
      if (portifoliotIndex !== -1) {
        state[portifoliotIndex] = portifolios;
      } else {
        newPortifolios.push(portifolios);
      }
    });

    return [...state, ...newPortifolios];
  }

  if (action.type === "UPDATE_PORTIFOLIOS") {
    const portifolios = action.payload;
    const portifoliotIndex = state.findIndex((p) => p.id === portifolios.id);

    if (portifoliotIndex !== -1) {
      state[portifoliotIndex] = portifolios;
      return [...state];
    } else {
      return [portifolios, ...state];
    }
  }

  if (action.type === "DELETE_PORTIFOLIO") {
    const portifolioId = action.payload;
    const portifoliotIndex = state.findIndex((p) => p.id === portifolioId);
    if (portifoliotIndex !== -1) {
      state.splice(portifoliotIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const Portifolios = () => {
  const classes = useStyles();

  const [portifolios, dispatch] = useReducer(reducer, []);
  const [loading, setLoading] = useState(false);

  const [portifolioModalOpen, setPortifolioModalOpen] = useState(false);
  const [selectedPortifolio, setSelectedPortifolio] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  //   const socketManager = useContext(SocketContext);
  const { user, socket } = useContext(AuthContext);
  const companyId = user.companyId;
 

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const { data } = await api.get("/portifolios");
        dispatch({ type: "LOAD_PORTIFOLIOS", payload: data.portifolios });

        setLoading(false);
      } catch (err) {
        toastError(err);
        setLoading(false);
      }
    })();
  }, []);

  useEffect(() => {
    // const socket = socketManager.GetSocket();

    const onPromptEvent = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PORTIFOLIOS", payload: data.portifolio });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PORTIFOLIO", payload: data.portifolioId });
      }
    };

    socket.on(`company-${companyId}-portifolios`, onPromptEvent);
    return () => {
      socket.off(`company-${companyId}-portifolios`, onPromptEvent);
    };
  }, [socket]);

  const handleOpenPortifolioModal = () => {
    setPortifolioModalOpen(true);
    setSelectedPortifolio(null);
  };

  const handleClosePortifolioModal = () => {
    setPortifolioModalOpen(false);
    setSelectedPortifolio(null);
  };

  const handleEditPortifolio = (portifolios) => {
    setSelectedPortifolio(portifolios);
    setPortifolioModalOpen(true);
  };

  const handleCloseConfirmationModal = () => {
    setConfirmModalOpen(false);
    setSelectedPortifolio(null);
  };

  const handleDeletePortifolio = async (portifolioId) => {
    try {
      const { data } = await api.delete(`/portifolios/${portifolioId}`);
      toast.info(i18n.t(data.message));
    } catch (err) {
      toastError(err);
    }
    setSelectedPortifolio(null);
  };

  return (
    <MainContainer>
      <ConfirmationModal
        title={
          selectedPortifolio &&
          `${i18n.t("portifolios.confirmationModal.deleteTitle")} ${
            selectedPortifolio.name
          }?`
        }
        open={confirmModalOpen}
        onClose={handleCloseConfirmationModal}
        onConfirm={() => handleDeletePortifolio(selectedPortifolio.id)}
      >
        {i18n.t("portifolios.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <PortifolioModal
        open={portifolioModalOpen}
        onClose={handleClosePortifolioModal}
        portifolioId={selectedPortifolio?.id}
      />
      <MainHeader>
        <Title>{i18n.t("portifolios.title")}</Title>
        <MainHeaderButtonsWrapper>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenPortifolioModal}
          >
            {i18n.t("portifolios.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper className={classes.mainPaper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
            <TableCell align="left">
                {i18n.t("portifolios.table.name")}
              </TableCell>
              <TableCell align="left">
                {i18n.t("portifolios.table.userId")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("portifolios.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {portifolios.map((portifolio) => (
                <TableRow key={portifolios.id}>
                  <TableCell align="left">{portifolio.name}</TableCell>
                  <TableCell align="left">{portifolio?.user?.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditPortifolio(portifolio)}
                    >
                      <Edit />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setSelectedPortifolio(portifolio);
                        setConfirmModalOpen(true);
                      }}
                    >
                      <DeleteOutline />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Portifolios;
