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
import ProductModal from "../../components/ProductModal";
import { Tooltip } from "@mui/material";
import { Avatar } from "@material-ui/core";
import { AttachMoney, Cancel, CheckCircle } from "@material-ui/icons";
import { green, red } from "@material-ui/core/colors";
import ProductStoreModal from "../../components/ProductStoreModal";

const reducer = (state, action) => {
  switch (action.type) {
    case "LOAD_PRODUCTS":
      return [...state, ...action.payload];
    case "UPDATE_PRODUCTS":
      const product = action.payload;
      const productIndex = state.findIndex((s) => s.id === product.id);

      if (productIndex !== -1) {
        state[productIndex] = product;
        return [...state];
      } else {
        return [product, ...state];
      }
    case "DELETE_PRODUCTS":
      const productId = action.payload;
      return state.filter((product) => product.id !== productId);
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

const Products = () => {
  const classes = useStyles();
  const { user, socket } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [deletingProduct, setDeletingProduct] = useState(null);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [searchParam, setSearchParam] = useState("");
  const [products, dispatch] = useReducer(reducer, []);
  const [productModalOpen, setProductModalOpen] = useState(false);
  const [productStoreModalOpen, setProductStoreModalOpen] = useState(false);

  useEffect(() => {
    const fetchMoreProducts = async () => {
      try {
        const { data } = await api.get("/products", {
          params: { searchParam, pageNumber },
        });
        dispatch({ type: "LOAD_PRODUCTS", payload: data.products });
        setHasMore(data.hasMore);
        setLoading(false);
      } catch (err) {
        toastError(err);
      }
    };

    if (pageNumber > 0) {
      setLoading(true);
      fetchMoreProducts();
    }
  }, [searchParam, pageNumber]);

  useEffect(() => {
    const onCompanyProducts = (data) => {
      if (data.action === "update" || data.action === "create") {
        dispatch({ type: "UPDATE_PRODUCTS", payload: data.product });
      }

      if (data.action === "delete") {
        dispatch({ type: "DELETE_PRODUCTS", payload: +data.productId });
      }
    };
    socket.on(`company-${user.companyId}-product`, onCompanyProducts);

    return () => {
      socket.off(`company-${user.companyId}-product`, onCompanyProducts);
    };
  }, [socket, user.companyId]);

  const handleOpenCategoryModal = () => {
    setSelectedProduct(null);
    setProductModalOpen(true);
  };

  const handleCloseProductModal = () => {
    setSelectedProduct(null);
    setProductModalOpen(false);
  };

  const handleCloseProductStoreModal = () => {
    setSelectedProduct(null);
    setProductStoreModalOpen(false);
  };


  const handleSearch = (event) => {
    const newSearchParam = event.target.value.toLowerCase();
    setSearchParam(newSearchParam);
    setPageNumber(1);
    dispatch({ type: "RESET" });
  };

  const handleEditProduct = (product) => {
    setSelectedProduct(product);
    setProductModalOpen(true);
  };

  const handleEditProductStore = product => {
    setSelectedProduct(product);
    setProductStoreModalOpen(true);
  };

  const handleDeleteProduct = async (productId) => {
    try {
      await api.delete(`/products/${productId}`);
      toast.success(i18n.t("products.toasts.deleted"));
    } catch (err) {
      toastError(err);
    }
    setDeletingProduct(null);
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
          deletingProduct &&
          `${i18n.t("products.confirmationModal.deleteTitle")}`
        }
        open={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        onConfirm={() => handleDeleteProduct(deletingProduct.id)}
      >
        {i18n.t("products.confirmationModal.deleteMessage")}
      </ConfirmationModal>
      <ProductModal
        open={productModalOpen}
        onClose={handleCloseProductModal}
        aria-labelledby="form-dialog-title"
        productId={selectedProduct && selectedProduct.id}
      />
       <ProductStoreModal
        open={productStoreModalOpen}
        onClose={handleCloseProductStoreModal}
        productId={selectedProduct && selectedProduct.id}
       
      />
      <MainHeader>
        <Title>
          {i18n.t("products.title")} ({products.length})
        </Title>
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
            {i18n.t("products.buttons.add")}
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
                {i18n.t("products.table.ean")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("products.table.code")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("products.table.name")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("products.table.category")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("products.table.isActive")}
              </TableCell>
              <TableCell align="center">
                {i18n.t("products.table.actions")}
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
          <>
              {products.map(product => (
                <TableRow key={product.id}>
                  <TableCell style={{ paddingRight: 0 }}>
                    <Tooltip
                      title={
                        <img
                          src={`${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${product.mediaPath}`}
                          alt="Produto"
                          style={{
                            width: "100%",
                            height: "100%",
                            objectFit: "cover",
                            borderRadius: 8,
                            border: "1px solid #ddd"
                          }}
                        />
                      }
                      arrow
                    >
                      <Avatar
                        src={`${process.env.REACT_APP_BACKEND_URL}/public/company${user.companyId}/${product.mediaPath}`}
                        variant="rounded" // ou "circular", dependendo do estilo desejado
                        style={{
                          width: 60,
                          height: 60,
                          objectFit: "cover",
                          border: "1px solid #ddd",
                          cursor: "pointer"
                        }}
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{product.ean}</TableCell>
                  <TableCell align="center">{product.code}</TableCell>
                  <TableCell align="center">{product.name}</TableCell>
                  <TableCell align="center">{product.category.name}</TableCell>
                  <TableCell align="center">
                    {product.isActive ? (
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
                      onClick={() => handleEditProductStore(product)}
                    >
                      <AttachMoney />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleEditProduct(product)}
                    >
                      <EditIcon />
                    </IconButton>

                    <IconButton
                      size="small"
                      onClick={e => {
                        setConfirmModalOpen(true);
                        setDeletingProduct(product);
                      }}
                    >
                      <DeleteOutlineIcon />
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

export default Products;
