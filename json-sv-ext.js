import jsonServer from "json-server"
import auth from "json-server-auth"; 
import {jwtDecode} from "jwt-decode"
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
import fs from "fs"
server.use(middlewares);
server.use(jsonServer.bodyParser);
const port = 3000;
server.db = router.db
server.use(auth)

// Hàm xử lý logic
const GetMaxID = (collection) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const data = db[collection];
    if (!data || data.length === 0) {
      return 0; 
    }
    const max = Math.max(...data.map(item => item.id));
    return max;
  } catch (error) {
    console.error(`Error in GetMaxID for ${collection}:`, error);
    return 0;
  }
};

const GetInfoById = (id, collection) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const data = db[collection];
    return data.filter(item => item.id == id).shift();
  } catch (error) {
    console.error(`Error in GetInfoById for ${collection}:`, error);
    return null;
  }
};

const GetInfoVariantProduct = (product) => {
  try {
    if (!product) return null;
    
    if (product.variant) {
      const variant = product.variant.map(item => {
        const info = GetInfoById(item.type, "variants");
        if (info) {
          info.items = undefined;
          return {...item, type: info};
        }
        return item;
      });
      return {...product, variant};
    }
    else return product;
  } catch (error) {
    console.error("Error in GetInfoVariantProduct:", error);
    return product;
  }
};

const Permission = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Vui lòng đăng nhập" });
  }
  
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwtDecode(token);
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const user = db.users.find((u) => u.email === decoded.email);
    if (!user) {
      return res.status(404).json({error: "Không tìm thấy user"});
    }
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ error: "Token không đúng, vui lòng đăng nhập" + error });
  }
};

// Router
server.post("/create-collection", (req, res) => {
  const collections = ["products", "variants", "carts", "orders", "categories"];
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    let isUpdated = false;
    
    for (const item of collections) {
      if (!db[item]) {
        db[item] = [];
        isUpdated = true;
      }
    }
    
    if (isUpdated) {
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    }

    res.status(201).json({ message: "Collections created successfully" });
  } catch (error) {
    console.error("Error creating collections:", error);
    res.status(500).json({ error: "Failed to update db.json", details: error.message });
  }
});

// Use the default router for categories
// This will handle standard RESTful routes for categories
// GET /categories
// GET /categories/:id
// POST /categories
// PUT /categories/:id
// DELETE /categories/:id

// Product endpoints
server.post("/products", (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));  
    const {variants} = req.body;
    const productData = {...req.body};
    delete productData.variants;
    
    const newProduct = {
      id: GetMaxID("products") + 1,
      ...productData,
      type: "simple",
      parent: 0
    };
    
    const product_variants = [];
    if (variants) {
      variants.forEach((items, index) => {
        const {price, image} = items;
        const itemData = {...items};
        delete itemData.price;
        delete itemData.image;
        
        const item = {
          id: GetMaxID("products") + 2 + index,
          ...productData,
          variant: items.key,
          price: price,
          image: image,
          type: "product_variation",
          parent: GetMaxID("products") + 1
        };
        product_variants.push(item);
      });
    }
    
    db.products = [...db.products, newProduct, ...product_variants];
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product", details: error.message });
  }
});

server.put("/products/:id", (req, res) => {
  try {
    const {id} = req.params;
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));  
    const {products} = db;
    const {variants} = req.body;
    const productData = {...req.body};
    delete productData.variants;
    
    const index = products.findIndex((p) => p.id === Number(id));
    if (index === -1) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    db.products[index] = { ...products[index], ...productData};
    const product_variants = [];  
    
    if (variants) {
      variants.forEach((items, index) => {
        const {price, image} = items;    
        items.name = productData.name;      
        
        if (items.id) {        
          const indexitem = products.findIndex((p) => p.id === Number(items.id));
          if (indexitem !== -1) {
            const variant = {...items};   
            delete variant.price;
            delete variant.id;
            delete items.key;
            db.products[indexitem] = { ...products[indexitem], ...items, variant: variant.key};
          }
        } else {
          delete items.price;
          delete items.image;
          const item = {
            id: GetMaxID("products") + 1 + index,
            ...productData,
            variant: items.key,
            price: price,
            image: image,
            type: "product_variation",
            parent: Number(id)
          };
          product_variants.push(item);
        }
      });
    }
    
    db.products = [...db.products, ...product_variants];
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    res.status(200).json(products[index]);
  } catch (error) {
    console.error(`Error updating product ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to update product", details: error.message });
  }
});

server.get("/products", (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {products, categories} = db;
    
    // Ensure categories exists
    if (!categories) {
      db.categories = [];
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    }
    
    const simpleproduct = products.filter(item => item.type == "simple");
    const result = simpleproduct.map(item => {
      const children = products.filter(child => child.parent == item.id && child.type == "product_variation");
      
      if (children.length > 0) {
        const pricearr = children.map(child => child.price);
        item.price = (Math.min(...pricearr) == Math.max(...pricearr)) ? 
          Math.min(...pricearr) : 
          `${Math.min(...pricearr)}-${Math.max(...pricearr)}`;
        item.type = "product_variable";
      }
      
      // Add category information if categoryId exists
      if (item.categoryId && categories) {
        const category = categories.find(cat => cat.id === Number(item.categoryId));
        if (category) {
          item.category = category;
        }
      }
      
      return item;
    });
    
    res.status(200).send(result);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ error: "Failed to fetch products", details: error.message });
  }
});

server.get("/products/:id", (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {products, categories} = db;
    const {id} = req.params;
    
    const product = products.filter(item => item.id == id).shift();
    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }
    
    const children = products.filter(child => child.parent == id && child.type == "product_variation");
    if (children.length > 0) {
      const pricearr = children.map(child => child.price);
      product.price = (Math.min(...pricearr) == Math.max(...pricearr)) ? 
        Math.min(...pricearr) : 
        `${Math.min(...pricearr)}-${Math.max(...pricearr)}`;
    }
    product.variants = children;
    
    // Add category information if categoryId exists
    if (product.categoryId && categories) {
      const category = categories.find(cat => cat.id === Number(product.categoryId));
      if (category) {
        product.category = category;
      }
    }
    
    res.status(200).json(product);
  } catch (error) {
    console.error(`Error fetching product ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to fetch product", details: error.message });
  }
});

server.delete("/products/:id", (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {products} = db;
    const {id} = req.params;
    
    const newproducts = products.filter(item => item.id != id).filter(item => item.parent != id);
    db.products = [...newproducts];
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    res.status(200).json({message: "Delete success!"});
  } catch (error) {
    console.error(`Error deleting product ${req.params.id}:`, error);
    res.status(500).json({ error: "Failed to delete product", details: error.message });
  }
});

const GetEndpoint = () => {
  try {
    const db = router.db; // Truy cập database json-server
    const endpoints = Object.keys(db.getState()).map((key) => ({
      url: `http://localhost:${port}/${key}`,
    }));
    console.log(`Danh sách các Endpoint:`, endpoints);
  } catch (error) {
    console.error("Error getting endpoints:", error);
  }
};

// Cart
server.post("/carts", Permission, (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {id: userId} = req.user;
    const {productId, quantity} = req.body;
    
    const index = db.carts.findIndex(item => item.userId == userId);
    if (index == -1) {
      const newcart = {
        id: GetMaxID("carts") + 1,
        userId: userId,
        Items: [{productId, quantity}]
      };
      db.carts = [...db.carts, newcart];
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
      res.status(200).json({message: "Thêm giỏ hàng thành công!", data: newcart}); 
    } else {
      const item = db.carts[index].Items.filter(item => item.productId == productId);
      if (item.length > 0) {
        db.carts[index].Items = db.carts[index].Items.map(item => 
          (item.productId == productId) ? 
            {...item, quantity: Number(item.quantity) + Number(quantity)} : 
            item
        );
      } else {
        db.carts[index].Items = [...db.carts[index].Items, {productId, quantity}];
      }
      const data = {...db.carts[index]};
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
      res.status(201).json({message: "Thêm giỏ hàng thành công!", data}); 
    }
  } catch (error) {
    console.error("Error adding to cart:", error);
    res.status(500).json({ error: "Failed to add to cart", details: error.message });
  }
});

server.get("/carts", Permission, (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {carts} = db;
    const {id: userId} = req.user;
    
    if (!userId) {
      return res.status(404).json({message: "Chưa đăng nhập!"}); 
    }
    
    const cartByUser = carts.filter(item => item.userId == userId).shift();
    if (!cartByUser) {
      return res.status(404).json({message: "Chưa có sản phẩm nào trong giỏ hàng!"}); 
    }
    
    cartByUser.Items = cartByUser.Items.map(item => {
      const productInfo = GetInfoById(item.productId, "products");
      return {...item, productId: GetInfoVariantProduct(productInfo)};
    });
    
    res.status(200).json({data: cartByUser}); 
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ error: "Failed to fetch cart", details: error.message });
  }
});

server.put("/carts", Permission, (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {id: userId} = req.user;
    const {items} = req.body;
    
    const index = db.carts.findIndex(item => item.userId == userId); 
    if (index === -1) {
      return res.status(404).json({message: "Không tìm thấy giỏ hàng!"});
    }
    
    db.carts[index] = {...db.carts[index], Items: items};
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    res.status(200).json({data: db.carts[index], message: "Cập nhật thành công"}); 
  } catch (error) {
    console.error("Error updating cart:", error);
    res.status(500).json({ error: "Failed to update cart", details: error.message });
  }
});

server.post("/orders", Permission, (req, res) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    const {userId} = req.body;
    
    const index = db.carts.findIndex(item => item.userId == userId); 
    if (index === -1) {
      return res.status(404).json({message: "Không tìm thấy giỏ hàng!"});
    }
    
    const data = req.body;
    const ItemOrder = data.items.map(item => item.productId);
    const orderSet = new Set(ItemOrder);
    
    const newItemCart = db.carts[index].Items.filter(item => {
      return !orderSet.has(item.productId);
    });
    
    db.carts[index].Items = [...newItemCart];
    
    data.items = data.items.map(item => {
      const productInfo = GetInfoById(item.productId, "products");
      return {...item, productId: GetInfoVariantProduct(productInfo)};
    });
    
    const neworder = {
      id: GetMaxID("orders") + 1,
      ...data
    };
    
    if (!db.orders) {
      db.orders = [];
    }
    
    db.orders = [...db.orders, neworder];
    fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    res.status(201).json({message: "Đặt hàng thành công!", data}); 
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order", details: error.message });
  }
});

// Make sure the categories collection exists
server.use((req, res, next) => {
  try {
    const db = JSON.parse(fs.readFileSync("db.json", "utf-8"));
    if (!db.categories) {
      db.categories = [];
      fs.writeFileSync("db.json", JSON.stringify(db, null, 2), "utf-8");
    }
    next();
  } catch (error) {
    console.error("Error checking categories collection:", error);
    next();
  }
});

// Use the router after all custom routes
server.use(router);

server.listen(port, () => {
  console.log(`Endpoint: http://localhost:${port}`);
  console.log(`Tạo mới collection: http://localhost:${port}/create-collection =>Method: POST`);  
  GetEndpoint();
});