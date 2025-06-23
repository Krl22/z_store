const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyHMqnajsD50YwGfkaPHBSJylt7HA5dvl4RPjO3bcNiIHWkkaO05g1ibEKrSSd5H_I6pA/exec";

export const addClientToSheet = async (clientData: {
  firebase_uid: string;
  nombre: string;
  apellido?: string;
  provincia: string;
  telefono: string;
  correo: string;
}) => {
  try {
    // Usar GET con parámetros para evitar CORS
    const params = new URLSearchParams({
      action: "addClient",
      clientData: JSON.stringify(clientData),
    });

    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log("Cliente agregado a Google Sheets:", result.message);
    } else {
      console.error("Error al agregar cliente:", result.error);
    }
  } catch (error) {
    console.error("Error al conectar con Google Sheets:", error);
  }
};

export const addSaleToSheet = async (saleData: {
  id: string;
  cliente: string;
  producto: string;
  cantidad: number;
  unidad: string;
  precio: number;
  total: number;
  fecha: string;
  estado: string;
}) => {
  try {
    // Usar GET con parámetros para evitar CORS
    const params = new URLSearchParams({
      action: "addSale",
      saleData: JSON.stringify(saleData),
    });

    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    if (result.success) {
      console.log("Venta agregada a Google Sheets:", result.message);
    } else {
      console.error("Error al agregar venta:", result.error);
    }
  } catch (error) {
    console.error("Error al conectar con Google Sheets:", error);
  }
};

// Función para generar ID de venta de 8 caracteres
export const generateSaleId = (): string => {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < 8; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

// Función para obtener clientes
export const getClientsFromSheet = async () => {
  try {
    const params = new URLSearchParams({
      action: "getClients",
    });

    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Error al obtener clientes:", error);
    return [];
  }
};

// Función para obtener productos
export const getProductsFromSheet = async () => {
  try {
    const params = new URLSearchParams({
      action: "getProducts",
    });

    const response = await fetch(`${GOOGLE_APPS_SCRIPT_URL}?${params}`, {
      method: "GET",
      redirect: "follow",
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const result = await response.json();
    return result.success ? result.data : [];
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return [];
  }
};
