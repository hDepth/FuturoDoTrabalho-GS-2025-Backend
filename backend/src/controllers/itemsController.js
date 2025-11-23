const Items = require("../models/items");


const util = require('util');

// ==========================================
// GET ALL ITEMS
// ==========================================
exports.getAll = async (req, res) => {
  try {
    let items = await Items.getAllItems();

    // DEBUG: informa o que foi retornado (não quebra em circular)
    console.log("DEBUG: items shape ->", {
      isArray: Array.isArray(items),
      keys: items && typeof items === 'object' ? Object.keys(items) : null,
      length: items && Array.isArray(items) ? items.length : undefined
    });
    console.log("DEBUG inspect (1 item / truncated):", util.inspect(items && (Array.isArray(items) ? items[0] : items), { depth: 2 }));

    // Se por algum motivo o model retornou o "result" do driver, extrai rows
    if (!Array.isArray(items) && items && items.rows) {
      items = items.rows;
    }

    // Garante que é um array (se não for, devolve array vazio)
    if (!Array.isArray(items)) items = [];

    // Remove possíveis referências circulares com um replacer seguro
    const getCircularReplacer = () => {
      const seen = new WeakSet();
      return (key, value) => {
        if (typeof value === "object" && value !== null) {
          if (seen.has(value)) return; // remove referência repetida
          seen.add(value);
        }
        return value;
      };
    };

    // Serializa e desserializa para garantir JSON-safe
    const safeSerialized = JSON.stringify(items, getCircularReplacer());
    const safeItems = JSON.parse(safeSerialized);

    return res.json(safeItems);

  } catch (err) {
    console.error("Erro ao listar items:", err);
    return res.status(500).json({ error: err.message });
  }
};

// ==========================================
// GET ITEM BY ID
// ==========================================
exports.getById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const item = await Items.getItemById(id);

    if (!item) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    return res.json({ ...item }); // safe

  } catch (error) {
    console.error("Erro ao buscar item:", error);
    return res.status(500).json({ error: "Erro ao buscar item." });
  }
};

// ==========================================
// CREATE ITEM
// ==========================================
exports.create = async (req, res) => {
  try {
    const item = await Items.createItem(req.body);
    return res.status(201).json({ ...item });
  } catch (error) {
    console.error("Erro ao criar item:", error);
    return res.status(500).json({ error: "Erro ao criar item." });
  }
};

// ==========================================
// UPDATE ITEM
// ==========================================
exports.update = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await Items.updateItem(id, req.body);

    if (!success) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    return res.json({ message: "Item atualizado com sucesso" });

  } catch (error) {
    console.error("Erro ao atualizar item:", error);
    return res.status(500).json({ error: "Erro ao atualizar item." });
  }
};

// ==========================================
// DELETE ITEM
// ==========================================
exports.delete = async (req, res) => {
  try {
    const id = Number(req.params.id);
    const success = await Items.deleteItem(id);

    if (!success) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    return res.json({ message: "Item deletado com sucesso" });

  } catch (error) {
    console.error("Erro ao deletar item:", error);
    return res.status(500).json({ error: "Erro ao deletar item." });
  }
};
