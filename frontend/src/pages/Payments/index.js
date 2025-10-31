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
import CategoryModal from "../../components/CategoryModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import PaymentModal from "../../components/PaymentModal";
import PaymentDetailModal from "../../components/PaymentDetailModal";
import { Cancel, CheckCircle, CreditCard } from "@material-ui/icons";
import { green, red } from "@material-ui/core/colors";


const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_PAYMENTS":
      return [...state, ...action.payload];
    case "UPDATE_PAYMENTS":
      const payment = action.payload;
      const paymentIndex = state.findIndex((s) => s.id === payment.id);

      if (paymentIndex !== -1) {
        state[paymentIndex] = payment;
        return [...state];
      } else {
        return [payment, ...state];
      }
    case "DELETE_PAYMENTS":
      const paymentId = action.payload;
      return state.filter((payment) => payment.id !== paymentId);
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

const Payments = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedPayment, setSelectedPayment] = useState(null);
  const [deletingPayment, setDeletingPayment] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [payments, dispatch] = useReducer(reducer, []);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentDetailModalOpen, setPaymentDetailModalOpen] = useState(false);

  useEffect(() => {
    const fetchMorePayments = async () => {
      try {
        const { data } = await api.get("/payments", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_PAYMENTS", payload: data.payments });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMorePayments();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyPayment = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PAYMENTS", payload: data.payment });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PAYMENTS", payload: +data.paymentId });
      }
    };
    socket.on(`company-${user.companyId}-payment`, onCompanyPayment);

    return () => {
      socket.off(`company-${user.companyId}-payment`, onCompanyPayment);
    };
  }, [socket, user.companyId]);

  const handleOpenPaymentModal = () => {
    setSelectedPayment(null);
    setPaymentModalOpen(true);
  };

  const handleClosePaymentModal = () => {
    setSelectedPayment(null);
    setPaymentModalOpen(false);
  };

  const hadleEditPaymentDetail = paymentId => {
    setSelectedPayment(paymentId);
    setPaymentDetailModalOpen(true);
  };
  
  const handleClosePaymentDetailModal = () => {
    setSelectedPayment(null);
    setPaymentDetailModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditPayment = (payment) => {
    setSelectedPayment(payment);
    setPaymentModalOpen(true);
  };

  const handleDeletePayment = async (paymentId) => {
    try {
      await api.delete(`/payments/${paymentId}`);
      dispatch({ type: "DELETE_PAYMENTS", payload: +paymentId });
      toast.success(i18n.t("payments.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingPayment(null);
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
        title={deletingPayment && `${i18n.t("payments.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeletePayment(deletingPayment.id)}
      >
        {i18n.t("payments.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <PaymentModal
        open={paymentModalOpen}
        onClose={handleClosePaymentModal}
        aria-labelledby="form-dialog-title"
        paymentId={selectedPayment && selectedPayment.id}
      />
      <PaymentDetailModal
        aria-labelledby="form-dialog-title"
        paymentId={selectedPayment && selectedPayment.id}
        open={paymentDetailModalOpen}
        onClose={handleClosePaymentDetailModal}
      />
      <MainHeader>
        <Title>{i18n.t("payments.title")} ({payments.length})</Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("contacts.searchPlaceholder")}
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
            onClick={handleOpenPaymentModal}
          >
            {i18n.t("payments.buttons.add")}
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
                {i18n.t("payments.table.code")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("payments.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("payments.table.type")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("payments.table.change")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("payments.table.installments")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("payments.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          <>
              {payments.map(payment => (
                <TableRow key={payment.id}>
                  <TableCell align="center">{payment.code}</TableCell>
                  <TableCell align="center">{payment.name}</TableCell>
                  <TableCell align="center">{payment.typePayment.code}</TableCell>
                  <TableCell align="center">
                    {payment.typePayment.change ? (
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
                    {payment.typePayment.installments ? (
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
                      disabled={!payment.typePayment.installments}
                      onClick={() => hadleEditPaymentDetail(payment)}
                    >
                      <CreditCard />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditPayment(payment)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={e => {
                        setConfirmModalOpen(true);
                        setDeletingPayment(payment);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={6} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Payments;
