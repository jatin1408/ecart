const client = contentful.createClient({
  // This is the space ID. A space is like a project folder in Contentful terms
  space: "7s0pcy0hiksi",
  // This is the access token for this space. Normally you get both ID and the token in the Contentful web app
  accessToken: "EkN7wf2mCu2cEq8vzT2xN9M5vZ8MX5ChJqpOiblhG8k"
});


const cartBtn = document.querySelector(".cart-btn");
const closeCartBtn = document.querySelector(".close-cart");
const clearCartBtn = document.querySelector(".clear-cart");
const cartOverlay = document.querySelector(".cart-overlay");
const cart = document.querySelector(".cart");
const cart_items = document.querySelector(".cart-items");
const cart_total = document.querySelector(".cart-total");
const cart_content = document.querySelector(".cart-content");
const productsDom = document.querySelector(".products-center");
let cartItemsArray = [];
let buttonsDOM = [];
class Products {
  async getProducts() {
    try {
      let contentful = await client.getEntries({
        content_type:"comfyHouseProduct"});
      console.log(contentful);
      //let result = await fetch("products.json");
      //let data = await result.json();
      let products = contentful.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (e) {
      return e;
    }
  }
}
class UI {
  displayProducts(products) {
    let result = "";
    products.forEach((product) => {
      result += `<article class="product">
        <div class="img-container">
            <img src=${product.image}
                alt="product" class="product-img">
            <button class="bag-btn" data-id=${product.id}>
                <i class="fas fa-shopping-cart"></i>
                add to cart
            </button>
        </div>
        <h3>${product.title}</h3>
        <h4>$${product.price}</h4>
    </article>
   `;
    });
    productsDom.innerHTML = result;
  }

  getButtons() {
    const a = [...document.querySelectorAll(".bag-btn")];
    buttonsDOM = a;
    a.forEach((item) => {
      let id = item.dataset.id;

      let inCart = cartItemsArray.find((item) => item.id == id);
      if (inCart) {
        item.innerText = "In Cart";
        item.disabled = true;
      }

      item.addEventListener("click", (event) => {
        event.target.innerText = "In Cart";
        event.target.disabled = true;
        let cartItem = { ...Storage.findItem(id), amount: 1 };
        cartItemsArray.push(cartItem);
        Storage.saveCart(cartItemsArray);
        this.setCartValues(cartItemsArray);
        this.addCartItems(cartItem);
        this.showCart();
      });
    });
  }
  setCartValues(cart) {
    let itemsTotal = 0;
    let itemsAmount = 0;
    cart.map((item) => {
      itemsAmount += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cart_total.innerText = parseFloat(itemsAmount.toFixed(2));
    cart_items.innerText = itemsTotal;
    console.log(cart_total, cart_items);
  }
  addCartItems(item) {
    let div = document.createElement("div");
    div.classList.add("cart-item");
    div.innerHTML = `<img src=${item.image} alt="product" />
            <div>
              <h4>${item.title}</h4>
              <h5>$${item.price}</h5>
              <span class="remove-item" data-id=${item.id}>remove</span>
            </div>
            <div>
              <i class="fas fa-chevron-up" data-id=${item.id}></i>
              <p class="item-amount">
                ${item.amount}
              </p>
              <i class="fas fa-chevron-down" data-id=${item.id}></i>
            </div>`;
    cart_content.appendChild(div);
    console.log(cart_content);
  }
  showCart() {
    cartOverlay.classList.add("transparentBcg");
    cart.classList.add("showCart");
  }
  setUpApp() {
    cartItemsArray = Storage.getCart();

    this.setCartValues(cartItemsArray);
    this.populateCartValues(cartItemsArray);
    cartBtn.addEventListener("click", (e) => {
      this.showCart();
    });
    closeCartBtn.addEventListener("click", (e) => {
      this.closeCart();
    });
  }
  closeCart() {
    cartOverlay.classList.remove("transparentBcg");
    cart.classList.remove("showCart");
  }
  populateCartValues(cart) {
    cart.forEach((item) => {
      this.addCartItems(item);
    });
  }
  cartLogic() {
    clearCartBtn.addEventListener("click", () => {
      this.clearCartLogic();
    });
    cart_content.addEventListener("click", (event) => {
      if (event.target.classList.contains("remove-item")) {
        let item = event.target;
        let id = item.dataset.id;

        cart_content.removeChild(item.parentElement.parentElement);
        this.removeItem(id);
      } else if (event.target.classList.contains("fa-chevron-up")) {
        let item = event.target;
        let id = item.dataset.id;
        let tempItem = cartItemsArray.find((item) => item.id === id);
        tempItem.amount += 1;
        Storage.saveCart(cartItemsArray);
        this.setCartValues(cartItemsArray);
        item.nextElementSibling.innerText = tempItem.amount;
      }
      else if (event.target.classList.contains("fa-chevron-down")){
        let item = event.target;
        let id = item.dataset.id;
        let tempItem = cartItemsArray.find((item) => item.id === id);
        tempItem.amount -= 1;
        if(tempItem.amount>0){
          Storage.saveCart(cartItemsArray);
          this.setCartValues(cartItemsArray);
          item.previousElementSibling.innerText = tempItem.amount;
        }
        else{
            cart_content.removeChild(item.parentElement.parentElement);
            this.removeItem(id);
        }
        
      }
    });
  }

  clearCartLogic() {
    let cartItems = cartItemsArray.map((item) => item.id);
    cartItems.forEach((id) => {
      this.removeItem(id);
    });
    console.log(cart_content);
    while (cart_content.children.length > 0) {
      cart_content.removeChild(cart_content.children[0]);
    }
  }
  removeItem(id) {
    cartItemsArray = cartItemsArray.filter((item) => item.id !== id);
    this.setCartValues(cartItemsArray);
    Storage.saveCart(cartItemsArray);

    let button = this.getButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  }
  getButton(id) {
    return buttonsDOM.find((button) => button.dataset.id === id);
  }
}
class Storage {
  static storeItem(products) {
    localStorage.setItem("products", JSON.stringify(products));
  }
  static findItem(id) {
    let pro = JSON.parse(localStorage.getItem("products"));
    return pro.find((item) => item.id === id);
  }
  static saveCart(cart) {
    localStorage.setItem("cart", JSON.stringify(cart));
  }
  static getCart() {
    return localStorage.getItem("cart")
      ? JSON.parse(localStorage.getItem("cart"))
      : [];
  }
}
document.addEventListener("DOMContentLoaded", (e) => {
  const ui = new UI();
  const products = new Products();
  ui.setUpApp();
  products
    .getProducts()
    .then((data) => {
      ui.displayProducts(data);
      Storage.storeItem(data);
    })
    .then(() => {
      ui.getButtons();
      ui.cartLogic();
    });
});
