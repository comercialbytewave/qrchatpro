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
import StoreModal from "../../components/StoreModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Cancel, CheckCircle } from "@material-ui/icons";
import { green, red } from "@material-ui/core/colors";


const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_STORES":
      return [...state, ...action.payload];
    case "UPDATE_STORES":
      const store = action.payload;
      const storeIndex = state.findIndex((s) => s.id === store.id);

      if (storeIndex !== -1) {
        state[storeIndex] = store;
        return [...state];
      } else {
        return [store, ...state];
      }
    case "DELETE_STORES":
      const storeId = action.payload;
      return state.filter((store) => store.id !== storeId);
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

const Stores = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedStore, setSelectedStore] = useState(null);
  const [deletingStore, setDeletingStore] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [stores, dispatch] = useReducer(reducer, []);
  const [storeModalOpen, setStoreModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreStores = async () => {
      try {
        const { data } = await api.get("/stores/", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_STORES", payload: data.stores });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreStores();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyStore = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_STORES", payload: data.store });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_STORES", payload: +data.storeId });
      }
    };
    socket.on(`company-${user.companyId}-store`, onCompanyStore);

    return () => {
      socket.off(`company-${user.companyId}-store`, onCompanyStore);
    };
  }, [socket, user.companyId]);

  const handleOpenStoreModal = () => {
    setSelectedStore(null);
    setStoreModalOpen(true);
  };

  const handleCloseStoreModal = () => {
    setSelectedStore(null);
    setStoreModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditStore = (store) => {
    setSelectedStore(store);
    setStoreModalOpen(true);
  };

  const handleDeleteStore = async (storeId) => {
    try {
      await api.delete(`/stores/${storeId}`);
      toast.success(i18n.t("stores.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingStore(null);
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
        title={deletingStore && `${i18n.t("stores.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteStore(deletingStore.id)}
      >
        {i18n.t("stores.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <StoreModal
        open={storeModalOpen}
        onClose={handleCloseStoreModal}
        aria-labelledby="form-dialog-title"
        storeId={selectedStore && selectedStore.id}
      />
      <MainHeader>
        <Title>{i18n.t("stores.title")} ({stores.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("stores.searchPlaceholder")}
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
            onClick={handleOpenStoreModal}
          >
            {i18n.t("stores.buttons.add")}
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
                {i18n.t("stores.table.document")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("stores.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("stores.table.fantasy")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("stores.table.isActive")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("stores.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {stores.map(store => (
                <TableRow key={stores.id}>
                  <TableCell align="center">{store.document}</TableCell>
                  <TableCell align="center">{store.name}</TableCell>
                  <TableCell align="center">{store.fantasy}</TableCell>
                  <TableCell align="center">
                    {store.isActive ? (
                      <div className={classes.customTableCell}>
                        <CheckCircle style={{ color: green[500] }} />
                      </div>
                    ) : (
                      <div className={classes.customTableCell}>
                        <Cancel style={{ color: red[500] }} />
                      </div>
                    )}
                    
                  </TableCell>
                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditStore(store)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={e => {
                        setConfirmModalOpen(true);
                        setDeletingStore(store);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                    
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={5} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Stores;
