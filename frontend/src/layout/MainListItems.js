import React, { useContext, useEffect, useReducer, useState } from "react";
import { Link as RouterLink, useLocation } from "react-router-dom";
import { makeStyles, useTheme } from "@material-ui/core/styles";
import useHelps from "../hooks/useHelps";
import ListItem from "@material-ui/core/ListItem";
import ListItemIcon from "@material-ui/core/ListItemIcon";
import ListItemText from "@material-ui/core/ListItemText";
import ListSubheader from "@material-ui/core/ListSubheader";
import Divider from "@material-ui/core/Divider";
import Avatar from "@material-ui/core/Avatar";
import Badge from "@material-ui/core/Badge";
import Collapse from "@material-ui/core/Collapse";
import List from "@material-ui/core/List";
import Tooltip from "@material-ui/core/Tooltip";
import Typography from "@material-ui/core/Typography";

import DashboardOutlinedIcon from "@material-ui/icons/DashboardOutlined";
import WhatsAppIcon from "@material-ui/icons/WhatsApp";
import SyncAltIcon from "@material-ui/icons/SyncAlt";
import SettingsOutlinedIcon from "@material-ui/icons/SettingsOutlined";
import PeopleAltOutlinedIcon from "@material-ui/icons/PeopleAltOutlined";
import ContactPhoneOutlinedIcon from "@material-ui/icons/ContactPhoneOutlined";
import AccountTreeOutlinedIcon from "@material-ui/icons/AccountTreeOutlined";
import FlashOnIcon from "@material-ui/icons/FlashOn";
import HelpOutlineIcon from "@material-ui/icons/HelpOutline";
import CodeRoundedIcon from "@material-ui/icons/CodeRounded";
import ViewKanban from "@mui/icons-material/ViewKanban";
import Schedule from "@material-ui/icons/Schedule";
import LocalOfferIcon from "@material-ui/icons/LocalOffer";
import EventAvailableIcon from "@material-ui/icons/EventAvailable";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import PeopleIcon from "@material-ui/icons/People";
import ListIcon from "@material-ui/icons/ListAlt";
import AnnouncementIcon from "@material-ui/icons/Announcement";
import ForumIcon from "@material-ui/icons/Forum";
import LocalAtmIcon from "@material-ui/icons/LocalAtm";
import BusinessIcon from "@material-ui/icons/Business";
import ShoppingBasket from "@material-ui/icons/ShoppingBasket";
import Apartment from "@material-ui/icons/Apartment";
import Memory from "@material-ui/icons/Memory";

import {
  AccountBalanceOutlined,
  AccountBalanceWalletOutlined,
  AllInclusive,
  ArtTrack,
  AttachFile,
  Dashboard,
  Description,
  DeviceHubOutlined,
  Folder,
  FolderOpen,
  FolderOpenOutlined,
  FolderOutlined,
  GridOn,
  ListAlt,
  Loyalty,
  PersonAddOutlined,
  PhonelinkSetup,
  PortraitOutlined,
  Storefront,
  Style,
  WrapText,
} from "@material-ui/icons";

import { WhatsAppsContext } from "../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../context/Auth/AuthContext";
import { useActiveMenu } from "../context/ActiveMenuContext";

import { Can } from "../components/Can";

import { isArray } from "lodash";
import api from "../services/api";
import toastError from "../errors/toastError";
import usePlans from "../hooks/usePlans";
import useVersion from "../hooks/useVersion";
import { i18n } from "../translate/i18n";
import { Campaign, ShapeLine, Webhook } from "@mui/icons-material";

const useStyles = makeStyles((theme) => ({
  listItem: {
    height: "44px",
    width: "auto",
    "&:hover $iconHoverActive": {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
    },
  },

  listItemText: {
    fontSize: "14px",
    color: theme.mode === "light" ? "#666" : "#FFF",
  },
  avatarActive: {
    backgroundColor: "transparent",
  },
  avatarHover: {
    backgroundColor: "transparent",
  },
  iconHoverActive: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "50%",
    height: 36,
    width: 36,
    backgroundColor:
      theme.mode === "light"
        ? "rgba(120,120,120,0.1)"
        : "rgba(120,120,120,0.5)",
    color: theme.mode === "light" ? "#666" : "#FFF",
    // color: theme.mode === "light" ? theme.palette.primary.main : "#FFF",
    "&:hover, &.active": {
      backgroundColor: theme.palette.primary.main,
      color: "#fff",
    },
    "& .MuiSvgIcon-root": {
      fontSize: "1.4rem",
    },
  },
}));

function ListItemLink(props) {
  const { icon, primary, to, tooltip, showBadge } = props;
  const classes = useStyles();
  const { activeMenu } = useActiveMenu();
  const location = useLocation();
  const isActive = activeMenu === to || location.pathname === to;

  const renderLink = React.useMemo(
    () =>
      React.forwardRef((itemProps, ref) => (
        <RouterLink to={to} ref={ref} {...itemProps} />
      )),
    [to]
  );

  const ConditionalTooltip = ({ children, tooltipEnabled }) =>
    tooltipEnabled ? (
      <Tooltip title={primary} placement="right">
        {children}
      </Tooltip>
    ) : (
      children
    );

  return (
    <ConditionalTooltip tooltipEnabled={!!tooltip}>
      <li>
        <ListItem button component={renderLink} className={classes.listItem}>
          {icon ? (
            <ListItemIcon>
              {showBadge ? (
                <Badge
                  badgeContent="!"
                  color="error"
                  overlap="circular"
                  className={classes.badge}
                >
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      isActive ? "active" : ""
                    }`}
                  >
                    {icon}
                  </Avatar>
                </Badge>
              ) : (
                <Avatar
                  className={`${classes.iconHoverActive} ${
                    isActive ? "active" : ""
                  }`}
                >
                  {icon}
                </Avatar>
              )}
            </ListItemIcon>
          ) : null}
          <ListItemText
            primary={
              <Typography className={classes.listItemText}>
                {primary}
              </Typography>
            }
          />
        </ListItem>
      </li>
    </ConditionalTooltip>
  );
}

const reducer = (state, action) => {
  if (action.type === "LOAD_CHATS") {
    const chats = action.payload;
    const newChats = [];

    if (isArray(chats)) {
      chats.forEach((chat) => {
        const chatIndex = state.findIndex((u) => u.id === chat.id);
        if (chatIndex !== -1) {
          state[chatIndex] = chat;
        } else {
          newChats.push(chat);
        }
      });
    }

    return [...state, ...newChats];
  }

  if (action.type === "UPDATE_CHATS") {
    const chat = action.payload;
    const chatIndex = state.findIndex((u) => u.id === chat.id);

    if (chatIndex !== -1) {
      state[chatIndex] = chat;
      return [...state];
    } else {
      return [chat, ...state];
    }
  }

  if (action.type === "DELETE_CHAT") {
    const chatId = action.payload;

    const chatIndex = state.findIndex((u) => u.id === chatId);
    if (chatIndex !== -1) {
      state.splice(chatIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }

  if (action.type === "CHANGE_CHAT") {
    const changedChats = state.map((chat) => {
      if (chat.id === action.payload.chat.id) {
        return action.payload.chat;
      }
      return chat;
    });
    return changedChats;
  }
};

const MainListItems = ({ collapsed, drawerClose }) => {
  const theme = useTheme();
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user, socket } = useContext(AuthContext);
  const { setActiveMenu } = useActiveMenu();
  const location = useLocation();

  const [connectionWarning, setConnectionWarning] = useState(false);
  const [openCampaignSubmenu, setOpenCampaignSubmenu] = useState(false);
  const [openFlowSubmenu, setOpenFlowSubmenu] = useState(false);
  const [openDashboardSubmenu, setOpenDashboardSubmenu] = useState(false);
  const [openRetailSubmenu, setOpenRetailSubmenu] = useState(false);
  const [openIntegrationSubmenu, setOpenIntegrationSubmenu] = useState(false);
  const [openProductSubmenu, setOpenProductSubmenu] = useState(false);
  const [openBudgetSubmenu, setOpenBudgetSubmenu] = useState(false);
  const [openCustomerSubmenu, setOpenCustomerSubmenu] = useState(false);

  const [showCampaigns, setShowCampaigns] = useState(false);
  const [showKanban, setShowKanban] = useState(false);
  const [showOpenAi, setShowOpenAi] = useState(false);
  const [showIntegrations, setShowIntegrations] = useState(false);
  const [showProducts, setShowProducts] = useState(false);
  const [showBudgets, setShowBudgets] = useState(false);
  const [showCustomers, setShowCustomers] = useState(false);
  // novas features
  const [showSchedules, setShowSchedules] = useState(false);
  const [showInternalChat, setShowInternalChat] = useState(false);
  const [showExternalApi, setShowExternalApi] = useState(false);
  const [showSales, setShowSales] = useState(false);

  const [invisible, setInvisible] = useState(true);
  const [pageNumber, setPageNumber] = useState(1);
  const [searchParam] = useState("");
  const [chats, dispatch] = useReducer(reducer, []);
  const [version, setVersion] = useState(false);
  const [managementHover, setManagementHover] = useState(false);
  const [campaignHover, setCampaignHover] = useState(false);
  const [flowHover, setFlowHover] = useState(false);
  const [retailHover, setRetailHover] = useState(false);
  const [integrationHover, setIntegrationHover] = useState(false);
  const [productHover, setProductHover] = useState(false);
  const [budgetHover, setBudgetHover] = useState(false);
  const [customerHover, setCustomerHover] = useState(false);

  const { list } = useHelps(); // INSERIR
  const [hasHelps, setHasHelps] = useState(false);

  useEffect(() => {
    // INSERIR ESSE EFFECT INTEIRO
    async function checkHelps() {
      const helps = await list();
      setHasHelps(helps.length > 0);
    }
    checkHelps();
  }, []);

  const isManagementActive =
    location.pathname === "/" ||
    location.pathname.startsWith("/reports") ||
    location.pathname.startsWith("/moments");

  const isCampaignRouteActive =
    location.pathname === "/campaigns" ||
    location.pathname.startsWith("/contact-lists") ||
    location.pathname.startsWith("/campaigns-config");

  const isFlowbuilderRouteActive =
    location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/flowbuilders");

  const isRatailRouteActive = location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/stores");

  const isIntegrationRouteActive =
    location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/prompts");

  const isProductRouteActive = location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/categories");

  const isCustomerRouteActive = location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/portifolios");

  const isBudgetRouteActive = location.pathname.startsWith("/phrase-lists");
  location.pathname.startsWith("/categories");

  useEffect(() => {
    if (location.pathname.startsWith("/tickets")) {
      setActiveMenu("/tickets");
    } else {
      setActiveMenu("");
    }
  }, [location, setActiveMenu]);

  const { getPlanCompany } = usePlans();

  const { getVersion } = useVersion();

  useEffect(() => {
    async function fetchVersion() {
      const _version = await getVersion();
      setVersion(_version.version);
    }
    fetchVersion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    async function fetchData() {
      const companyId = user.companyId;
      const planConfigs = await getPlanCompany(undefined, companyId);

      setShowCampaigns(planConfigs.plan.useCampaigns);
      setShowKanban(planConfigs.plan.useKanban);
      setShowOpenAi(planConfigs.plan.useOpenAi);
      setShowIntegrations(planConfigs.plan.useIntegrations);
      setShowSchedules(planConfigs.plan.useSchedules);
      setShowInternalChat(planConfigs.plan.useInternalChat);
      setShowExternalApi(planConfigs.plan.useExternalApi);
      setShowSales(planConfigs.plan.useSales);
    }
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChats();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParam, pageNumber]);

  useEffect(() => {
    if (user.id) {
      const companyId = user.companyId;
      //    const socket = socketManager.GetSocket();
      // console.log('socket nListItems')
      const onCompanyChatMainListItems = (data) => {
        if (data.action === "new-message") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
        if (data.action === "update") {
          dispatch({ type: "CHANGE_CHAT", payload: data });
        }
      };

      socket.on(`company-${companyId}-chat`, onCompanyChatMainListItems);
      return () => {
        socket.off(`company-${companyId}-chat`, onCompanyChatMainListItems);
      };
    }
  }, [socket]);

  useEffect(() => {
    let unreadsCount = 0;
    if (chats.length > 0) {
      for (let chat of chats) {
        for (let chatUser of chat.users) {
          if (chatUser.userId === user.id) {
            unreadsCount += chatUser.unreads;
          }
        }
      }
    }
    if (unreadsCount > 0) {
      setInvisible(false);
    } else {
      setInvisible(true);
    }
  }, [chats, user.id]);

  // useEffect(() => {
  //   if (localStorage.getItem("cshow")) {
  //     setShowCampaigns(true);
  //   }
  // }, []);

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      if (whatsApps.length > 0) {
        const offlineWhats = whatsApps.filter((whats) => {
          return (
            whats.status === "qrcode" ||
            whats.status === "PAIRING" ||
            whats.status === "DISCONNECTED" ||
            whats.status === "TIMEOUT" ||
            whats.status === "OPENING"
          );
        });
        if (offlineWhats.length > 0) {
          setConnectionWarning(true);
        } else {
          setConnectionWarning(false);
        }
      }
    }, 2000);
    return () => clearTimeout(delayDebounceFn);
  }, [whatsApps]);

  const fetchChats = async () => {
    try {
      const { data } = await api.get("/chats/", {
        params: { searchParam, pageNumber },
      });
      dispatch({ type: "LOAD_CHATS", payload: data.records });
    } catch (err) {
      toastError(err);
    }
  };

  return (
    <div onClick={drawerClose}>
      <Can
        role={
          (user.profile === "user" && user.showDashboard === "enabled") ||
          user.allowRealTime === "enabled"
            ? "admin"
            : user.profile
        }
        perform={"drawer-admin-items:view"}
        yes={() => (
          <>
            <Tooltip
              title={collapsed ? i18n.t("mainDrawer.listItems.management") : ""}
              placement="right"
            >
              <ListItem
                dense
                button
                onClick={() => setOpenDashboardSubmenu((prev) => !prev)}
                onMouseEnter={() => setManagementHover(true)}
                onMouseLeave={() => setManagementHover(false)}
              >
                <ListItemIcon>
                  <Avatar
                    className={`${classes.iconHoverActive} ${
                      isManagementActive || managementHover ? "active" : ""
                    }`}
                  >
                    <Dashboard />
                  </Avatar>
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography className={classes.listItemText}>
                      {i18n.t("mainDrawer.listItems.management")}
                    </Typography>
                  }
                />
                {openDashboardSubmenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </ListItem>
            </Tooltip>
            <Collapse
              in={openDashboardSubmenu}
              timeout="auto"
              unmountOnExit
              style={{
                backgroundColor:
                  theme.mode === "light"
                    ? "rgba(120,120,120,0.1)"
                    : "rgba(120,120,120,0.5)",
              }}
            >
              <Can
                role={
                  user.profile === "user" && user.showDashboard === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <>
                    <ListItemLink
                      small
                      to="/"
                      primary="Dashboard"
                      icon={<DashboardOutlinedIcon />}
                      tooltip={collapsed}
                    />
                    <ListItemLink
                      small
                      to="/reports"
                      primary={i18n.t("mainDrawer.listItems.reports")}
                      icon={<Description />}
                      tooltip={collapsed}
                    />
                  </>
                )}
              />
              <Can
                role={
                  user.profile === "user" && user.allowRealTime === "enabled"
                    ? "admin"
                    : user.profile
                }
                perform={"drawer-admin-items:view"}
                yes={() => (
                  <ListItemLink
                    to="/moments"
                    primary={i18n.t("mainDrawer.listItems.chatsTempoReal")}
                    icon={<GridOn />}
                    tooltip={collapsed}
                  />
                )}
              />
            </Collapse>
          </>
        )}
      />
      <ListItemLink
        to="/tickets"
        primary={i18n.t("mainDrawer.listItems.tickets")}
        icon={<WhatsAppIcon />}
        tooltip={collapsed}
      />

      <ListItemLink
        to="/quick-messages"
        primary={i18n.t("mainDrawer.listItems.quickMessages")}
        icon={<FlashOnIcon />}
        tooltip={collapsed}
      />

      {showKanban && (
        <>
          <ListItemLink
            to="/kanban"
            primary={i18n.t("mainDrawer.listItems.kanban")}
            icon={<ViewKanban />}
            tooltip={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/contacts"
        primary={i18n.t("mainDrawer.listItems.contacts")}
        icon={<ContactPhoneOutlinedIcon />}
        tooltip={collapsed}
      />

      {showSchedules && (
        <>
          <ListItemLink
            to="/schedules"
            primary={i18n.t("mainDrawer.listItems.schedules")}
            icon={<Schedule />}
            tooltip={collapsed}
          />
        </>
      )}

      <ListItemLink
        to="/tags"
        primary={i18n.t("mainDrawer.listItems.tags")}
        icon={<LocalOfferIcon />}
        tooltip={collapsed}
      />

      {showInternalChat && (
        <>
          <ListItemLink
            to="/chats"
            primary={i18n.t("mainDrawer.listItems.chats")}
            icon={
              <Badge color="secondary" variant="dot" invisible={invisible}>
                <ForumIcon />
              </Badge>
            }
            tooltip={collapsed}
          />
        </>
      )}

      {/* <ListItemLink
        to="/todolist"
        primary={i18n.t("ToDoList")}
        icon={<EventAvailableIcon />}
      /> */}
      {hasHelps && (
        <ListItemLink
          to="/helps"
          primary={i18n.t("mainDrawer.listItems.helps")}
          icon={<HelpOutlineIcon />}
          tooltip={collapsed}
        />
      )}
      <Can
        role={
          user.profile === "user" && user.allowConnections === "enabled"
            ? "admin"
            : user.profile
        }
        perform="dashboard:view"
        yes={() => (
          <>
            <Divider />
            <ListSubheader inset>
              {i18n.t("mainDrawer.listItems.administration")}
            </ListSubheader>
            <Can
              role={
                user.profile === "user" && user.allowConnections === "enabled"
                  ? "admin"
                  : user.profile
              }
              perform={"drawer-admin-items:view"}
              yes={() => (
                <ListItemLink
                  to="/connections"
                  primary={i18n.t("mainDrawer.listItems.connections")}
                  icon={<SyncAltIcon />}
                  showBadge={connectionWarning}
                  tooltip={collapsed}
                />
              )}
            />
            {showCampaigns && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={
                        collapsed
                          ? i18n.t("mainDrawer.listItems.campaigns")
                          : ""
                      }
                      placement="right"
                    >
                      <ListItem
                        dense
                        button
                        onClick={() => setOpenCampaignSubmenu((prev) => !prev)}
                        onMouseEnter={() => setCampaignHover(true)}
                        onMouseLeave={() => setCampaignHover(false)}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${
                              isCampaignRouteActive || campaignHover
                                ? "active"
                                : ""
                            }`}
                          >
                            <EventAvailableIcon />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className={classes.listItemText}>
                              {i18n.t("mainDrawer.listItems.campaigns")}
                            </Typography>
                          }
                        />
                        {openCampaignSubmenu ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </ListItem>
                    </Tooltip>
                    <Collapse
                      in={openCampaignSubmenu}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        backgroundColor:
                          theme.mode === "light"
                            ? "rgba(120,120,120,0.1)"
                            : "rgba(120,120,120,0.5)",
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/campaigns"
                          primary={i18n.t("campaigns.subMenus.list")}
                          icon={<ListIcon />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/contact-lists"
                          primary={i18n.t("campaigns.subMenus.listContacts")}
                          icon={<PeopleIcon />}
                          tooltip={collapsed}
                        />
                        <ListItemLink
                          to="/campaigns-config"
                          primary={i18n.t("campaigns.subMenus.settings")}
                          icon={<SettingsOutlinedIcon />}
                          tooltip={collapsed}
                        />
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}
            <List dense component="div" disablePadding>
              {!showCustomers && (
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <>
                      <Tooltip
                        title={
                          collapsed
                            ? i18n.t("mainDrawer.listItems.products")
                            : ""
                        }
                        placement="right"
                      >
                        <ListItem
                          dense
                          button
                          onClick={() =>
                            setOpenCustomerSubmenu((prev) => !prev)
                          }
                          onMouseEnter={() => setCustomerHover(true)}
                          onMouseLeave={() => setCustomerHover(false)}
                        >
                          <ListItemIcon>
                            <Avatar
                              className={`${classes.iconHoverActive} ${
                                isCustomerRouteActive || customerHover
                                  ? "active"
                                  : ""
                              }`}
                            >
                              <PortraitOutlined />
                            </Avatar>
                          </ListItemIcon>
                          <ListItemText
                            primary={
                              <Typography className={classes.listItemText}>
                                {i18n.t("mainDrawer.listItems.customers")}
                              </Typography>
                            }
                          />
                          {openCustomerSubmenu ? (
                            <ExpandLessIcon />
                          ) : (
                            <ExpandMoreIcon />
                          )}
                        </ListItem>
                      </Tooltip>
                      <Collapse
                        in={openCustomerSubmenu}
                        timeout="auto"
                        unmountOnExit
                        style={{
                          backgroundColor:
                            theme.mode === "light"
                              ? "rgba(120,120,120,0.1)"
                              : "rgba(120,120,120,0.5)",
                        }}
                      >
                        <List dense component="div" disablePadding>
                          <ListItemLink
                            to="/customers"
                            primary={i18n.t("mainDrawer.listItems.customers")}
                            icon={<PersonAddOutlined />}
                            tooltip={collapsed}
                          />
                          <ListItemLink
                            to="/portifolios"
                            primary={i18n.t("mainDrawer.listItems.portifolios")}
                            icon={<AccountBalanceWalletOutlined />}
                            tooltip={collapsed}
                          />
                        </List>
                      </Collapse>
                    </>
                  )}
                />
              )}
            </List>

            {/* VAREJO */}
            {showSales && (
              <Can
                role={user.profile}
                perform="dashboard:view"
                yes={() => (
                  <>
                    <Tooltip
                      title={
                        collapsed ? i18n.t("mainDrawer.listItems.retail") : ""
                      }
                      placement="right"
                    >
                      <ListItem
                        dense
                        button
                        onClick={() => setOpenRetailSubmenu((prev) => !prev)}
                        onMouseEnter={() => setRetailHover(true)}
                        onMouseLeave={() => setRetailHover(false)}
                      >
                        <ListItemIcon>
                          <Avatar
                            className={`${classes.iconHoverActive} ${
                              isRatailRouteActive || retailHover ? "active" : ""
                            }`}
                          >
                            <ShoppingBasket />
                          </Avatar>
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Typography className={classes.listItemText}>
                              {i18n.t("Varejo")}
                            </Typography>
                          }
                        />
                        {openRetailSubmenu ? (
                          <ExpandLessIcon />
                        ) : (
                          <ExpandMoreIcon />
                        )}
                      </ListItem>
                    </Tooltip>

                    <Collapse
                      in={openRetailSubmenu}
                      timeout="auto"
                      unmountOnExit
                      style={{
                        backgroundColor:
                          theme.mode === "light"
                            ? "rgba(120,120,120,0.1)"
                            : "rgba(120,120,120,0.5)",
                      }}
                    >
                      <List dense component="div" disablePadding>
                        <ListItemLink
                          to="/enterprises"
                          primary={"Matriz"}
                          icon={<Apartment />}
                        />
                        <ListItemLink
                          to="/stores"
                          primary={i18n.t("mainDrawer.listItems.stores")}
                          icon={<Storefront />}
                        />
                        {/* VAREJO */}
                        {!showCustomers && (
                          <Can
                            role={user.profile}
                            perform="dashboard:view"
                            yes={() => (
                              <>
                                <Tooltip
                                  title={
                                    collapsed
                                      ? i18n.t("mainDrawer.listItems.products")
                                      : ""
                                  }
                                  placement="right"
                                >
                                  <ListItem
                                    dense
                                    button
                                    onClick={() =>
                                      setOpenCustomerSubmenu((prev) => !prev)
                                    }
                                    onMouseEnter={() => setCustomerHover(true)}
                                    onMouseLeave={() => setCustomerHover(false)}
                                  >
                                    <ListItemIcon>
                                      <Avatar
                                        className={`${
                                          classes.iconHoverActive
                                        } ${
                                          isCustomerRouteActive || customerHover
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <PortraitOutlined />
                                      </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          className={classes.listItemText}
                                        >
                                          {i18n.t(
                                            "mainDrawer.listItems.customers"
                                          )}
                                        </Typography>
                                      }
                                    />
                                    {openCustomerSubmenu ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </ListItem>
                                </Tooltip>
                                <Collapse
                                  in={openCustomerSubmenu}
                                  timeout="auto"
                                  unmountOnExit
                                  style={{
                                    backgroundColor:
                                      theme.mode === "light"
                                        ? "rgba(120,120,120,0.1)"
                                        : "rgba(120,120,120,0.5)",
                                  }}
                                >
                                  <List dense component="div" disablePadding>
                                    <ListItemLink
                                      to="/customers"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.customers"
                                      )}
                                      icon={<PersonAddOutlined />}
                                      tooltip={collapsed}
                                    />
                                    <ListItemLink
                                      to="/portifolios"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.portifolios"
                                      )}
                                      icon={<AccountBalanceWalletOutlined />}
                                      tooltip={collapsed}
                                    />
                                  </List>
                                </Collapse>
                              </>
                            )}
                          />
                        )}
                        {!showProducts && (
                          <Can
                            role={user.profile}
                            perform="dashboard:view"
                            yes={() => (
                              <>
                                <Tooltip
                                  title={
                                    collapsed
                                      ? i18n.t("mainDrawer.listItems.products")
                                      : ""
                                  }
                                  placement="right"
                                >
                                  <ListItem
                                    dense
                                    button
                                    onClick={() =>
                                      setOpenProductSubmenu((prev) => !prev)
                                    }
                                    onMouseEnter={() => setProductHover(true)}
                                    onMouseLeave={() => setProductHover(false)}
                                  >
                                    <ListItemIcon>
                                      <Avatar
                                        className={`${
                                          classes.iconHoverActive
                                        } ${
                                          isProductRouteActive || productHover
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        <Loyalty />
                                      </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          className={classes.listItemText}
                                        >
                                          {i18n.t(
                                            "mainDrawer.listItems.products"
                                          )}
                                        </Typography>
                                      }
                                    />
                                    {openProductSubmenu ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </ListItem>
                                </Tooltip>
                                <Collapse
                                  in={openProductSubmenu}
                                  timeout="auto"
                                  unmountOnExit
                                  style={{
                                    backgroundColor:
                                      theme.mode === "light"
                                        ? "rgba(120,120,120,0.1)"
                                        : "rgba(120,120,120,0.5)",
                                  }}
                                >
                                  <List dense component="div" disablePadding>
                                    <ListItemLink
                                      to="/categories"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.categories"
                                      )}
                                      icon={<Style />}
                                      tooltip={collapsed}
                                    />
                                    <ListItemLink
                                      to="/products"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.products"
                                      )}
                                      icon={<ArtTrack />}
                                      tooltip={collapsed}
                                    />
                                  </List>
                                </Collapse>
                              </>
                            )}
                          />
                        )}
                        {!showBudgets && (
                          <Can
                            role={user.profile}
                            perform="dashboard:view"
                            yes={() => (
                              <>
                                <Tooltip
                                  title={
                                    collapsed
                                      ? i18n.t("mainDrawer.listItems.budgets")
                                      : ""
                                  }
                                  placement="right"
                                >
                                  <ListItem
                                    dense
                                    button
                                    onClick={() =>
                                      setOpenBudgetSubmenu((prev) => !prev)
                                    }
                                    onMouseEnter={() => setBudgetHover(true)}
                                    onMouseLeave={() => setBudgetHover(false)}
                                  >
                                    <ListItemIcon>
                                      <Avatar
                                        className={`${
                                          classes.iconHoverActive
                                        } ${
                                          isBudgetRouteActive || budgetHover
                                            ? "active"
                                            : ""
                                        }`}
                                      >
                                        {openBudgetSubmenu ? (
                                          <FolderOutlined />
                                        ) : (
                                          <FolderOpenOutlined />
                                        )}
                                      </Avatar>
                                    </ListItemIcon>
                                    <ListItemText
                                      primary={
                                        <Typography
                                          className={classes.listItemText}
                                        >
                                          {"Auxiliares"}
                                        </Typography>
                                      }
                                    />
                                    {openBudgetSubmenu ? (
                                      <ExpandLessIcon />
                                    ) : (
                                      <ExpandMoreIcon />
                                    )}
                                  </ListItem>
                                </Tooltip>
                                <Collapse
                                  in={openBudgetSubmenu}
                                  timeout="auto"
                                  unmountOnExit
                                  style={{
                                    backgroundColor:
                                      theme.mode === "light"
                                        ? "rgba(120,120,120,0.1)"
                                        : "rgba(120,120,120,0.5)",
                                  }}
                                >
                                  <List dense component="div" disablePadding>
                                    <ListItemLink
                                      to="/payments"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.paymentMethods"
                                      )}
                                      icon={<LocalAtmIcon />}
                                      tooltip={collapsed}
                                    />
                                    <ListItemLink
                                      to="/statusBudGets"
                                      primary={i18n.t(
                                        "mainDrawer.listItems.statusBudGets"
                                      )}
                                      icon={<WrapText />}
                                      tooltip={collapsed}
                                    />
                                  </List>
                                </Collapse>
                              </>
                            )}
                          />
                        )}
                      </List>
                    </Collapse>
                  </>
                )}
              />
            )}

            {/* INTEGRAÇÕES */}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <>
                  <Tooltip
                    title={
                      collapsed
                        ? i18n.t("mainDrawer.listItems.integrations")
                        : ""
                    }
                    placement="right"
                  >
                    <ListItem
                      dense
                      button
                      onClick={() => setOpenIntegrationSubmenu((prev) => !prev)}
                      onMouseEnter={() => setIntegrationHover(true)}
                      onMouseLeave={() => setIntegrationHover(false)}
                    >
                      <ListItemIcon>
                        <Avatar
                          className={`${classes.iconHoverActive} ${
                            isIntegrationRouteActive || integrationHover
                              ? "active"
                              : ""
                          }`}
                        >
                          <Memory />
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography className={classes.listItemText}>
                            {i18n.t("Integrações")}
                          </Typography>
                        }
                      />
                      {openIntegrationSubmenu ? (
                        <ExpandLessIcon />
                      ) : (
                        <ExpandMoreIcon />
                      )}
                    </ListItem>
                  </Tooltip>

                  <Collapse
                    in={openIntegrationSubmenu}
                    timeout="auto"
                    unmountOnExit
                    style={{
                      backgroundColor:
                        theme.mode === "light"
                          ? "rgba(120,120,120,0.1)"
                          : "rgba(120,120,120,0.5)",
                    }}
                  >
                    <List dense component="div" disablePadding>
                      {showOpenAi && (
                        <Can
                          role={user.profile}
                          perform="dashboard:view"
                          yes={() => (
                            <ListItemLink
                              to="/prompts"
                              primary={i18n.t("mainDrawer.listItems.prompts")}
                              icon={<AllInclusive />}
                              tooltip={collapsed}
                            />
                          )}
                        />
                      )}

                      {showIntegrations && (
                        <Can
                          role={user.profile}
                          perform="dashboard:view"
                          yes={() => (
                            <ListItemLink
                              to="/queue-integration"
                              primary={i18n.t(
                                "mainDrawer.listItems.queueIntegration"
                              )}
                              icon={<DeviceHubOutlined />}
                              tooltip={collapsed}
                            />
                          )}
                        />
                      )}

                      {/* FLOWBUILDER */}
                      <Can
                        role={user.profile}
                        perform="dashboard:view"
                        yes={() => (
                          <>
                            <Tooltip
                              title={
                                collapsed
                                  ? i18n.t("mainDrawer.listItems.campaigns")
                                  : ""
                              }
                              placement="right"
                            >
                              <ListItem
                                dense
                                button
                                onClick={() =>
                                  setOpenFlowSubmenu((prev) => !prev)
                                }
                                onMouseEnter={() => setFlowHover(true)}
                                onMouseLeave={() => setFlowHover(false)}
                              >
                                <ListItemIcon>
                                  <Avatar
                                    className={`${classes.iconHoverActive} ${
                                      isFlowbuilderRouteActive || flowHover
                                        ? "active"
                                        : ""
                                    }`}
                                  >
                                    <Webhook />
                                  </Avatar>
                                </ListItemIcon>
                                <ListItemText
                                  primary={
                                    <Typography
                                      className={classes.listItemText}
                                    >
                                      {i18n.t("Flowbuilder")}
                                    </Typography>
                                  }
                                />
                                {openFlowSubmenu ? (
                                  <ExpandLessIcon />
                                ) : (
                                  <ExpandMoreIcon />
                                )}
                              </ListItem>
                            </Tooltip>

                            <Collapse
                              in={openFlowSubmenu}
                              timeout="auto"
                              unmountOnExit
                              style={{
                                backgroundColor:
                                  theme.mode === "light"
                                    ? "rgba(120,120,120,0.1)"
                                    : "rgba(120,120,120,0.5)",
                              }}
                            >
                              <List dense component="div" disablePadding>
                                <ListItemLink
                                  to="/phrase-lists"
                                  primary={"Fluxo de Campanha"}
                                  icon={<EventAvailableIcon />}
                                  tooltip={collapsed}
                                />

                                <ListItemLink
                                  to="/flowbuilders"
                                  primary={"Fluxo de conversa"}
                                  icon={<ShapeLine />}
                                />
                              </List>
                            </Collapse>
                          </>
                        )}
                      />
                    </List>
                  </Collapse>
                </>
              )}
            />

            {showExternalApi && (
              <>
                <Can
                  role={user.profile}
                  perform="dashboard:view"
                  yes={() => (
                    <ListItemLink
                      to="/messages-api"
                      primary={i18n.t("mainDrawer.listItems.messagesAPI")}
                      icon={<CodeRoundedIcon />}
                      tooltip={collapsed}
                    />
                  )}
                />
              </>
            )}
            {user.super && (
              <ListItemLink
                to="/announcements"
                primary={i18n.t("mainDrawer.listItems.annoucements")}
                icon={<AnnouncementIcon />}
                tooltip={collapsed}
              />
            )}

            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/users"
                  primary={i18n.t("mainDrawer.listItems.users")}
                  icon={<PeopleAltOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/queues"
                  primary={i18n.t("mainDrawer.listItems.queues")}
                  icon={<AccountTreeOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />

            {user.super && (
              <ListItemLink
                to="/allConnections"
                primary={i18n.t("mainDrawer.listItems.allConnections")}
                icon={<PhonelinkSetup />}
                tooltip={collapsed}
              />
            )}
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/files"
                  primary={i18n.t("mainDrawer.listItems.files")}
                  icon={<AttachFile />}
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/financeiro"
                  primary={i18n.t("mainDrawer.listItems.financeiro")}
                  icon={<LocalAtmIcon />}
                  tooltip={collapsed}
                />
              )}
            />
            <Can
              role={user.profile}
              perform="dashboard:view"
              yes={() => (
                <ListItemLink
                  to="/settings"
                  primary={i18n.t("mainDrawer.listItems.settings")}
                  icon={<SettingsOutlinedIcon />}
                  tooltip={collapsed}
                />
              )}
            />
            {/* {user.super && (
              <ListSubheader inset>
                {i18n.t("mainDrawer.listItems.administration")}
              </ListSubheader>
            )} */}

            {user.super && (
              <ListItemLink
                to="/companies"
                primary={i18n.t("mainDrawer.listItems.companies")}
                icon={<BusinessIcon />}
                tooltip={collapsed}
              />
            )}
          </>
        )}
      />
      {!collapsed && (
        <React.Fragment>
          <Divider />
          {/* 
              // IMAGEM NO MENU
              <Hidden only={['sm', 'xs']}>
                <img style={{ width: "100%", padding: "10px" }} src={logo} alt="image" />            
              </Hidden> 
              */}
          <Typography
            style={{
              fontSize: "12px",
              padding: "10px",
              textAlign: "center",
              fontWeight: "bold",
            }}
          >
            {`${version}`}
          </Typography>
        </React.Fragment>
      )}
    </div>
  );
};

export default MainListItems;
