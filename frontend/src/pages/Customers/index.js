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
import moment from "moment";
import { Cancel, CheckCircle, EmojiTransportation } from "@material-ui/icons";
import { green, red } from "@material-ui/core/colors";
import CustomerModal from "../../components/CustomerModal";
import CustomerAddressModal from "../../components/CustomerAddressModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CUSTOMERS":
      return [...state, ...action.payload];
    case "UPDATE_CUSTOMERS":
      const customer = action.payload;
      const customerIndex = state.findIndex((s) => s.id === customer.id);

      if (customerIndex !== -1) {
        state[customerIndex] = customer;
        return [...state];
      } else {
        return [customer, ...state];
      }
    case "DELETE_CUSTOMERS":
      const customerId = action.payload;
      return state.filter((customer) => customer.id !== customerId);
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

const Customers = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);
  const [deletingCustomer, setDeletingCustomer] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [customers, dispatch] = useReducer(reducer, []);
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [customerAddressModalOpen, setCustomertAddressModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreCustomer = async () => {
      try {
        const { data } = await api.get("/customers", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_CUSTOMERS", payload: data.customers });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreCustomer();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyCustomer = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CUSTOMERS", payload: data.customer });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CUSTOMERS", payload: +data.customerId });
      }
    };
    socket.on(`company-${user.companyId}-customers`, onCompanyCustomer);

    return () => {
      socket.off(`company-${user.companyId}-customers`, onCompanyCustomer);
    };
  }, [socket, user.companyId]);

  const handleOpenCustomerModal = () => {
    setSelectedCustomer(null);
    setCustomerModalOpen(true);
  };

  const handleCloseCustomerModal = () => {
    setSelectedCustomer(null);
    setCustomerModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditCustomer = (customer) => {
    setSelectedCustomer(customer);
    setCustomerModalOpen(true);
  };

  const handleDeleteCustomer = async (customerId) => {
    try {
      await api.delete(`/customers/${customerId}`);
      dispatch({ type: "DELETE_CUSTOMERS", payload: +customerId });
      toast.success(i18n.t("customers.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCustomer(null);
    setSearchParam("");
    setPageNumber(1);
  };

  const hadleEditCustomerAddress = customerId => {
    setSelectedCustomerId(customerId);
    setCustomertAddressModalOpen(true);
  };

  const handleCloseCustomertAddressModal = () => {
    setSelectedCustomerId(null);
    setCustomertAddressModalOpen(false);
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
          deletingCustomer &&
          `${i18n.t("customers.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteCustomer(deletingCustomer.id)}
      >
        {i18n.t("customers.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CustomerModal
        open={customerModalOpen}
        onClose={handleCloseCustomerModal}
        aria-labelledby="form-dialog-title"
        customerId={selectedCustomer && selectedCustomer.id}
      />
       <CustomerAddressModal
        aria-labelledby="form-dialog-title"
        customerId={selectedCustomerId }
        open={customerAddressModalOpen}
        onClose={handleCloseCustomertAddressModal}
      />
      <MainHeader>
        <Title>
          {i18n.t("customers.title")} ({customers.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("customers.searchPlaceholder")}
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
            onClick={handleOpenCustomerModal}
          >
            {i18n.t("customers.buttons.add")}
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
                {i18n.t("customers.table.document")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.email")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.birthday")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.portifolio")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.customerDefault")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("customers.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell align="center">{customer.document}</TableCell>
                  <TableCell align="center">{customer.fullName}</TableCell>
                  <TableCell align="center">{customer.email}</TableCell>
                  <TableCell align="center">
                    {moment(customer.birthday).format("DD/MM")}
                  </TableCell>

                  <TableCell align="center">
                    {customer.portifolio.name}
                  </TableCell>
                  <TableCell align="center">
                    {customer.customerDefault ? (
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
                      onClick={() => handleEditCustomer(customer)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={(e) => {
                        setConfirmModalOpen(true);
                        setDeletingCustomer(customer);
                      }}
                    >
                      <DeleteOutlineIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => hadleEditCustomerAddress(customer.id)}
                    >
                      <EmojiTransportation />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={7} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Customers;
