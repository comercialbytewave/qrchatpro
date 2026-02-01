import axios from "axios";
import FormData from "form-data";
import { createReadStream } from "fs";
import logger from "../../utils/logger";

const formData: FormData = new FormData();

const apiBase = (token: string) =>
  axios.create({
    baseURL: "https://graph.facebook.com/v18.0/",
    timeout: 30000, // 30 segundos de timeout
    params: {
      access_token: token
    }
  });

export const getAccessToken = async (): Promise<string> => {
  const { data } = await axios.get(
    "https://graph.facebook.com/v18.0/oauth/access_token",
    {
      params: {
        client_id: process.env.FACEBOOK_APP_ID,
        client_secret: process.env.FACEBOOK_APP_SECRET,
        grant_type: "client_credentials"
      }
    }
  );

  return data.access_token;
};

export const markSeen = async (id: string, token: string): Promise<void> => {
  await apiBase(token).post(`${id}/messages`, {
    recipient: {
      id
    },
    sender_action: "mark_seen"
  });
};

export const showTypingIndicator = async (
  id: string,
  token: string,
  action: string
): Promise<void> => {

  try {
    const { data } = await apiBase(token).post("me/messages", {
      recipient: {
        id: id
      },
      sender_action: action
    })

    return data;
  } catch (error) {
    //console.log(error);
  }

}


export const sendText = async (
  id: string | number,
  text: string,
  token: string,
  senderId?: string
): Promise<void> => {
  try {
    const endpoint = senderId ? `${senderId}/messages` : "me/messages";
    const { data } = await apiBase(token).post(endpoint, {
      recipient: {
        id
      },
      message: {
        text: `${text}`,
      }
    });
    return data;
  } catch (error: any) {
    const message = error?.response?.data;
    if (message?.error?.code === 100 && message?.error?.type === "OAuthException") {
      // Tentar envio alternativo para Instagram se falhar com erro de OAuth (comum quando se usa endpoint errado)
      // Mas o ideal é receber o channel ID correto.
      // Como esta função é genérica, vamos adicionar log
      logger.error(`[FACEBOOK] Error sending text: ${JSON.stringify(message)}`);
    } else {
      logger.error(`[FACEBOOK] Error sending text: ${JSON.stringify(message)}`);
    }
    throw new Error("ERR_SENDING_FACEBOOK_MSG");
  }
};

export const sendAttachmentFromUrl = async (
  id: string,
  url: string,
  type: string,
  token: string,
  senderId?: string
): Promise<void> => {
  try {
    const endpoint = senderId ? `${senderId}/messages` : "me/messages";
    const { data } = await apiBase(token).post(endpoint, {
      recipient: {
        id
      },
      message: {
        attachment: {
          type,
          payload: {
            url
          }
        }
      }
    });

    return data;
  } catch (error) {
    //console.log(error);
  }
};

export const sendAttachment = async (
  id: string,
  file: Express.Multer.File,
  type: string,
  token: string,
  senderId?: string
): Promise<void> => {
  formData.append(
    "recipient",
    JSON.stringify({
      id
    })
  );

  formData.append(
    "message",
    JSON.stringify({
      attachment: {
        type,
        payload: {
          is_reusable: true
        }
      }
    })
  );

  const fileReaderStream = createReadStream(file.path);

  formData.append("filedata", fileReaderStream);

  try {
    const endpoint = senderId ? `${senderId}/messages` : "me/messages";
    await apiBase(token).post(endpoint, formData, {
      headers: {
        ...formData.getHeaders()
      }
    });
  } catch (error) {
    throw new Error(error);
  }
};

export const genText = (text: string): any => {
  const response = {
    text
  };

  return response;
};

export const getProfile = async (id: string, token: string): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(id);

    return data;
  } catch (error) {
    console.log(error);
    throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
  }
};

export const getPageProfile = async (
  id: string,
  token: string
): Promise<any> => {
  logger.info(`[FACEBOOK] getPageProfile - Starting request for user ID: ${id}`);
  const startTime = Date.now();

  try {

    const { data } = await apiBase(token).get(
      `${id}/accounts?fields=name,access_token,instagram_business_account{id,username,profile_picture_url,name}`
    );
    logger.info(`[FACEBOOK] getPageProfile - Success in ${Date.now() - startTime}ms, found ${data?.data?.length || 0} pages`);
    return data;
  } catch (error: any) {
    logger.error(`[FACEBOOK] getPageProfile - Error after ${Date.now() - startTime}ms`);
    logger.error(`[FACEBOOK] getPageProfile - Error details: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    throw new Error("ERR_FETCHING_FB_PAGES");
  }
};

export const profilePsid = async (id: string, token: string, channel?: string): Promise<any> => {
  logger.info(`[FACEBOOK] profilePsid - Fetching profile for ID: ${id}, channel: ${channel || 'unknown'}`);

  try {
    // Para Instagram, usamos campos específicos que são suportados
    const fields = channel === 'instagram'
      ? 'name,profile_pic'
      : 'name,first_name,last_name,profile_pic';

    const { data } = await axios.get(
      `https://graph.facebook.com/v18.0/${id}?fields=${fields}&access_token=${token}`,
      { timeout: 30000 }
    );

    logger.info(`[FACEBOOK] profilePsid - Success for ID ${id}: ${JSON.stringify(data)}`);
    return data;
  } catch (error: any) {
    logger.error(`[FACEBOOK] profilePsid - Error fetching profile for ID ${id}`);
    logger.error(`[FACEBOOK] profilePsid - Error details: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`);

    // Para Instagram, retornar um perfil básico se falhar a busca
    if (channel === 'instagram') {
      logger.info(`[FACEBOOK] profilePsid - Returning basic profile for Instagram user ${id}`);
      return {
        id: id,
        name: `Instagram User ${id.slice(-6)}`,
        profile_pic: null
      };
    }

    // Para Facebook, tentar o fallback com getProfile
    try {
      return await getProfile(id, token);
    } catch (fallbackError) {
      throw new Error("ERR_FETCHING_FB_USER_PROFILE_2");
    }
  }
};

export const subscribeApp = async (id: string, token: string): Promise<any> => {
  logger.info(`[FACEBOOK] subscribeApp - Starting subscription for page ID: ${id}`);
  const startTime = Date.now();

  try {
    const { data } = await axios.post(
      `https://graph.facebook.com/v18.0/${id}/subscribed_apps?access_token=${token}`,
      {
        subscribed_fields: [
          "messages",
          "messaging_postbacks",
          "message_deliveries",
          "message_reads",
          "message_echoes"
        ]
      },
      { timeout: 30000 }
    );
    logger.info(`[FACEBOOK] subscribeApp - Success in ${Date.now() - startTime}ms`);
    return data;
  } catch (error: any) {
    logger.error(`[FACEBOOK] subscribeApp - Error after ${Date.now() - startTime}ms`);
    logger.error(`[FACEBOOK] subscribeApp - Error details: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    throw new Error("ERR_SUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};

export const unsubscribeApp = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await axios.delete(
      `https://graph.facebook.com/v18.0/${id}/subscribed_apps?access_token=${token}`
    );
    return data;
  } catch (error) {
    throw new Error("ERR_UNSUBSCRIBING_PAGE_TO_MESSAGE_WEBHOOKS");
  }
};


export const getSubscribedApps = async (
  id: string,
  token: string
): Promise<any> => {
  try {
    const { data } = await apiBase(token).get(`${id}/subscribed_apps`);
    return data;
  } catch (error) {
    throw new Error("ERR_GETTING_SUBSCRIBED_APPS");
  }
};

export const getAccessTokenFromPage = async (
  token: string
): Promise<string> => {
  logger.info(`[FACEBOOK] getAccessTokenFromPage - Starting token exchange`);
  const startTime = Date.now();

  try {
    if (!token) throw new Error("ERR_FETCHING_FB_USER_TOKEN");

    const data = await axios.get(
      "https://graph.facebook.com/v18.0/oauth/access_token",
      {
        timeout: 30000, // 30 segundos de timeout
        params: {
          client_id: process.env.FACEBOOK_APP_ID,
          client_secret: process.env.FACEBOOK_APP_SECRET,
          grant_type: "fb_exchange_token",
          fb_exchange_token: token
        }
      }
    );

    logger.info(`[FACEBOOK] getAccessTokenFromPage - Success in ${Date.now() - startTime}ms`);
    return data.data.access_token;
  } catch (error: any) {
    logger.error(`[FACEBOOK] getAccessTokenFromPage - Error after ${Date.now() - startTime}ms`);
    logger.error(`[FACEBOOK] getAccessTokenFromPage - Error details: ${error?.response?.data ? JSON.stringify(error.response.data) : error.message}`);
    throw new Error("ERR_FETCHING_FB_USER_TOKEN");
  }
};

export const removeApplcation = async (
  id: string,
  token: string
): Promise<void> => {
  try {
    await axios.delete(`https://graph.facebook.com/v18.0/${id}/permissions`, {
      params: {
        access_token: token
      }
    });
  } catch (error) {
    logger.error("ERR_REMOVING_APP_FROM_PAGE");
  }
};