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


const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_CATEGORIES":
      return [...state, ...action.payload];
    case "UPDATE_CATEGORIES":
      const category = action.payload;
      const categoryIndex = state.findIndex((s) => s.id === category.id);

      if (categoryIndex !== -1) {
        state[categoryIndex] = category;
        return [...state];
      } else {
        return [category, ...state];
      }
    case "DELETE_CATEGORIES":
      const categoryId = action.payload;
      return state.filter((category) => category.id !== categoryId);
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

const Categories = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deletingCategory, setDeletingCategory] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [categories, dispatch] = useReducer(reducer, []);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreCategories = async () => {
      try {
        const { data } = await api.get("/categories", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_CATEGORIES", payload: data.categories });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreCategories();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyCategories = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_CATEGORIES", payload: data.category });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_CATEGORIES", payload: +data.categoryId });
      }
    };
    socket.on(`company-${user.companyId}-category`, onCompanyCategories);

    return () => {
      socket.off(`company-${user.companyId}-category`, onCompanyCategories);
    };
  }, [socket, user.companyId]);

  const handleOpenCategoryModal = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(true);
  };

  const handleCloseCategoryModal = () => {
    setSelectedCategory(null);
    setCategoryModalOpen(false);
  };

  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditCategory = (category) => {
    setSelectedCategory(category);
    setCategoryModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await api.delete(`/categories/${categoryId}`);
      toast.success(i18n.t("categories.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingCategory(null);
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
        title={deletingCategory && `${i18n.t("categories.confirmationModal.deleteTitle")}`}
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteCategory(deletingCategory.id)}
      >
        {i18n.t("categories.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <CategoryModal
        open={categoryModalOpen}
        onClose={handleCloseCategoryModal}
        aria-labelledby="form-dialog-title"
        categoryId={selectedCategory && selectedCategory.id}
      />
      <MainHeader>
        <Title>{i18n.t("categories.title")} ({categories.length})</Title>
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
            onClick={handleOpenCategoryModal}
          >
            {i18n.t("categories.buttons.add")}
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
              <TableCell align="center">{i18n.t("categories.table.code")}</TableCell>
              <TableCell align="center">{i18n.t("categories.table.name")}</TableCell>
              <TableCell align="center">
                {i18n.t("categories.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            <>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell align="center">{category.code}</TableCell>
                  <TableCell align="center">{category.name}</TableCell>
                  <TableCell align="center">
                    <IconButton size="small" onClick={() => handleEditCategory(category)}>
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={() => {
                        setConfirmModalOpen(true);
                        setDeletingCategory(category);
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

export default Categories;
