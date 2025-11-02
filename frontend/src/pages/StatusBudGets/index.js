import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import IconButton from "@material-ui/core/IconButton";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import InputAdornment from "@material-ui/core/InputAdornment";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import EditIcon from "@material-ui/icons/Edit";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import MainHeaderButtonsWrapper from "../../components/MainHeaderButtonsWrapper";
import Title from "../../components/Title";
import api from "../../services/api";
import { i18n } from "../../translate/i18n";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import StatusBudGetModal from "../../components/SatusBudGetModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_STATUSBUDGETS":
      return [...state, ...action.payload];
    case "UPDATE_STATUSBUDGETS":
      const statusBudget = action.payload;
      const statusBudgetIndex = state.findIndex(
        (s) => s.id === statusBudget.id
      );

      if (statusBudgetIndex !== -1) {
        state[statusBudgetIndex] = statusBudget;
        return [...state];
      } else {
        return [statusBudget, ...state];
      }
    case "DELETE_STATUSBUDGETS":
      const statusBudgetId = action.payload;
      return state.filter((statusBudget) => statusBudget.id !== statusBudgetId);
    case "RESET":
      return [];
    default:
      return state;
  }
};

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
}));

const StatusBudgets = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedStatusBudGet, setSelectedStatusBudGet] = useState(null);
  const [deletingStatusBudGet, setDeletingStatusBudGet] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [statusBudGets, dispatch] = useReducer(reducer, []);
  const [statusBudGetModalOpen, setStatusBudGetModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreStatusBudGet = async () => {
      try {
        const { data } = await api.get("/statusBudGets", {
          params: { searchParam, pageNumber },
        });
        console.log(data);
        dispatch({ type: "LOAD_STATUSBUDGETS", payload: data.statusBudGets });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreStatusBudGet();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyStatusBudGet = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_STATUSBUDGETS", payload: data.statusBudGet });
      }

      if (data.action === "delete") {
        dispatch({
          type: "DELETE_STATUSBUDGETS",
          payload: +data.statusBudgetId,
        });
      }
    };
    socket.on(`company-${user.companyId}-statusBudGets`, onCompanyStatusBudGet);

    return () => {
      socket.off(
        `company-${user.companyId}-statusBudGets`,
        onCompanyStatusBudGet
      );
    };
  }, [socket, user.companyId]);

  const handleOpenStatusBudGetModal = () => {
    setSelectedStatusBudGet(null);
    setStatusBudGetModalOpen(true);
  };

  const handleCloseStatusBudGetModal = () => {
    setSelectedStatusBudGet(null);
    setStatusBudGetModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditStatusBudGet = (statusBudget) => {
    console.log(statusBudget);
    setSelectedStatusBudGet(statusBudget);
    setStatusBudGetModalOpen(true);
  };

  const handleDeleteStatusBudGet = async (statusBudgetId) => {
    try {
      await api.delete(`/statusBudGets/${statusBudgetId}`);
      dispatch({ type: "DELETE_STATUSBUDGETS", payload: +statusBudgetId });
      toast.success(i18n.t("statusBudGets.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingStatusBudGet(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const loadMore = () => {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  return (
    <MainContainer className={classes.mainContainer}>
      <ConfirmationModal
        title={
          deletingStatusBudGet &&
          `${i18n.t("statusBudGets.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteStatusBudGet(deletingStatusBudGet.id)}
      >
        {i18n.t("statusBudGets.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <StatusBudGetModal
        open={statusBudGetModalOpen}
        onClose={handleCloseStatusBudGetModal}
        aria-labelledby="form-dialog-title"
        statusBudgetId={selectedStatusBudGet && selectedStatusBudGet.id}
      />
      <MainHeader>
        <Title>
          {i18n.t("statusBudGets.title")} ({statusBudGets.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("statusBudGets.searchPlaceholder")}
            type="search"
            value={searchParam}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon style={{ color: "gray" }} />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpenStatusBudGetModal}
          >
            {i18n.t("statusBudGets.buttons.add")}
          </Button>
        </MainHeaderButtonsWrapper>
      </MainHeader>
      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell align="center">
                {i18n.t("statusBudGets.table.code")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("statusBudGets.table.name")}
              </TableCell>

              <TableCell align="center">
                {i18n.t("statusBudGets.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {statusBudGets.map((statusBudget) => (
                <TableRow key={statusBudget.id}>
                  <TableCell align="center">{statusBudget.code}</TableCell>
                  <TableCell align="center">{statusBudget.name}</TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditStatusBudGet(statusBudget)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingStatusBudGet(statusBudget);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}

              {loading && <TableRowSkeleton key="skeleton" columns={3} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default StatusBudgets;
