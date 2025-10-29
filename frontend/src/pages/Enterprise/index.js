import React, {
  useState,
  useEffect,
  useReducer,
  useContext,
  useRef,
} from "react";
import { toast } from "react-toastify";
import moment from "moment";
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
import EnterpriseModal from "../../components/EnterpriseModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import toastError from "../../errors/toastError";
import { AuthContext } from "../../context/Auth/AuthContext";
import { Tooltip } from "@mui/material";
import { Avatar } from "@material-ui/core";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_COMPANIES":
      return [...state, ...action.payload];
    case "UPDATE_COMPANIES":
      const company = action.payload;
      const companyIndex = state.findIndex((s) => s.id === company.id);

      if (companyIndex !== -1) {
        state[companyIndex] = company;
        return [...state];
      } else {
        return [company, ...state];
      }
    case "DELETE_COMPANIES":
      const companyId = action.payload;
      return state.filter((company) => company.id !== companyId);
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

const Enterprise = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedCompany, setSelectedCompany] = useState(null);
  const [deletingCompany, setDeletingCompany] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [companies, dispatch] = useReducer(reducer, []);
  const [companyModalOpen, setCompanyModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreCompanies = async () => {
      try {
        const { data } = await api.get(`/companies/${user.companyId}`);
        console.log(data);
        dispatch({ type: "LOAD_COMPANIES", payload: [data] });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreCompanies();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompany = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_COMPANIES", payload: data.store });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_COMPANIES", payload: +data.companyId });
      }
    };
    socket.on(`company-${user.companyId}-company`, onCompany);

    return () => {
      socket.off(`company-${user.companyId}-company`, onCompany);
    };
  }, [socket, user.companyId]);

  const handleOpenCompanyModal = () => {
    setSelectedCompany(null);
    setCompanyModalOpen(true);
  };

  const handleCloseCompanyModal = () => {
    setSelectedCompany(null);
    setCompanyModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditCompany = (store) => {
    setSelectedCompany(store);
    setCompanyModalOpen(true);
  };

  const handleDeleteCompany = async (companyId) => {
    try {
      await api.delete(`/companies/${companyId}`);
      toast.success(i18n.t("companies.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCompany(null);
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
          deletingCompany &&
          `${i18n.t("companies.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteCompany(deletingCompany.id)}
      >
        {i18n.t("companies.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <EnterpriseModal
        open={companyModalOpen}
        onClose={handleCloseCompanyModal}
        aria-labelledby="form-dialog-title"
        companyId={selectedCompany && selectedCompany.id}
      />
      <MainHeader>
        <Title>
          {i18n.t("companies.title")} ({companies.length})
        </Title>
        <MainHeaderButtonsWrapper>
          <TextField
            placeholder={i18n.t("companies.searchPlaceholder")}
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
            disabled={true}
            onClick={handleOpenCompanyModal}
          >
            {i18n.t("companies.buttons.add")}
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
              <TableCell padding="checkbox" />
              <TableCell align="center">
                {i18n.t("companies.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("companies.table.phone")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("companies.table.email")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("companies.table.dueDate")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("companies.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {companies.map((company) => (
                <TableRow key={company.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    <Tooltip
                      title={
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/public/${company.mediaPath}`}
                          alt="Produto"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ddd",
                          }}
                        />
                      }
                      arrow
                    >
                      <Avatar
                        src={`${process.env.REACT_APP_BACKEND_URL}/public/${company.mediaPath}`}
                        variant="rounded" // ou "circular", dependendo do estilo desejado
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                          cursor: "pointer",
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{company.name}</TableCell>
                  <TableCell align="center">{company.phone}</TableCell>
                  <TableCell align="center">{company.email}</TableCell>
                  <TableCell align="center">
                    {moment(company.dueDate).format("DD/MM/YYYY")}
                  </TableCell>

                  <TableCell align="center">
                    <IconButton
                      size="small"
                      onClick={() => handleEditCompany(company)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      disabled
                      
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

export default Enterprise;
