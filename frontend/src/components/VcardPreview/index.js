import React, { useEffect, useState, useContext } from "react";
import { useHistory } from "react-router-dom";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";

import {
  Avatar,
  Typography,
  Grid,
  Button,
  Divider,
  useTheme
} from "@material-ui/core";

import { isNil } from "lodash";
import ShowTicketOpen from "../ShowTicketOpenModal";

const VcardPreview = ({ contact, numbers, queueId, whatsappId }) => {
  const theme = useTheme();
  const history = useHistory();
  const { user } = useContext(AuthContext);

  const companyId = user.companyId;

  const [openAlert, setOpenAlert] = useState(false);
  const [userTicketOpen, setUserTicketOpen] = useState("");
  const [queueTicketOpen, setQueueTicketOpen] = useState("");

  const [selectedContact, setSelectedContact] = useState({
    id: null,
    name: "",
    number: "",
    profilePicUrl: ""
  });

  useEffect(() => {
    if (isNil(numbers)) return;

    const timeout = setTimeout(async () => {
      try {
        const numberClean = numbers.replace(/\D/g, "");

        const { data } = await api.get(`/contacts/profile/${numberClean}`);

        // Se contato existir
        if (data?.contactId) {
          setSelectedContact({
            id: data.contactId,
            name: contact || data.name || numberClean,
            number: numberClean,
            profilePicUrl: data.profilePicUrl || ""
          });
          return;
        }

        // Criar contato
        const contactPayload = {
          name: contact || numberClean,
          number: numberClean,
          email: "",
          companyId
        };

        const { data: newContact } = await api.post("/contacts", contactPayload);

        setSelectedContact({
          id: newContact.id,
          name: newContact.name,
          number: newContact.number,
          profilePicUrl: newContact.profilePicUrl || ""
        });

      } catch (err) {
        console.error(err);
        toastError(err);
      }
    }, 400);

    return () => clearTimeout(timeout);
  }, [numbers, companyId]);

  const handleCloseAlert = () => {
    setOpenAlert(false);
    setUserTicketOpen("");
    setQueueTicketOpen("");
  };

  const handleNewChat = async () => {
    try {
      const { data: ticket } = await api.post("/tickets", {
        contactId: selectedContact.id,
        userId: user.id,
        status: "open",
        queueId,
        companyId,
        whatsappId
      });

      history.push(`/tickets/${ticket.uuid}`);
    } catch (err) {
      const ticket = JSON.parse(err.response.data.error);

      if (ticket.userId !== user.id) {
        setOpenAlert(true);
        setUserTicketOpen(ticket.user.name);
        setQueueTicketOpen(ticket.queue.name);
      } else {
        history.push(`/tickets/${ticket.uuid}`);
      }
    }
  };

  return (
    <div style={{ minWidth: 250 }}>
      <ShowTicketOpen
        isOpen={openAlert}
        handleClose={handleCloseAlert}
        user={userTicketOpen}
        queue={queueTicketOpen}
      />

      <Grid container spacing={1} alignItems="center">
        <Grid item xs={2}>
          <Avatar src={selectedContact.profilePicUrl} />
        </Grid>

        <Grid item xs={9}>
          <Typography
            style={{ marginTop: 12, marginLeft: 10 }}
            color="primary"
            variant="subtitle1"
          >
            {selectedContact.name}
          </Typography>
        </Grid>

        <Grid item xs={12}>
          <Divider />
          <Button
            fullWidth
            color="primary"
            onClick={handleNewChat}
            disabled={!selectedContact.id}
          >
            Conversar
          </Button>
        </Grid>
      </Grid>
    </div>
  );
};

export default VcardPreview;
