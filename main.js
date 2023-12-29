let allItems = [];
let cardBtnList = []
const mainPageList = document.querySelector('.section__list');
const allItemPageList = document.querySelector('.all-items__list')
const loadingAnimation = document.createElement('div')
loadingAnimation.className = 'lds-dual-ring'


async function getItems() {
    mainPageList.appendChild(loadingAnimation)
    await fetch(`http://localhost:3000/items`).then(res => res.json()).then(result => {allItems = result; })
    mainPageList.removeChild(loadingAnimation)
    renderItemsList(allItems.slice(0, 8), mainPageList)
}

getItems()

const headerLogo = document.querySelector('.header__logo');
const mainPage = document.querySelector('.section-food');
const allItemsPage = document.querySelector('.all-items');
const modalBlackScreen = document.querySelector('.dark')


headerLogo.addEventListener('click', () => {
    mainPage.classList.remove('hide');
    allItemsPage.classList.add('hide');
})

const showAllButton = document.querySelector('.show-all-btn');

showAllButton.addEventListener('click', () => {
    allItemPageList.innerHTML = ''
    document.body.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
    })
    allItemsPage.classList.remove('hide');
    mainPage.classList.add('hide');
    renderItemsList(allItems, allItemPageList)
})

const cartBtn = document.querySelector('.header__btn');
const sidebarCart = document.querySelector('.sidebar');

cartBtn.addEventListener('click', () => {
    document.body.classList.toggle('no-scroll');
    sidebarCart.classList.toggle('hide');
    modalBlackScreen.classList.toggle('hide')
    cart.renderCart()
})

document.addEventListener('mouseup', (e) => {
    const target = e.target;
    if (!target.classList.contains('sidebar') && !target.classList.contains('in-sidebar')) {
        sidebarCart.classList.add('hide');
        document.body.classList.remove('no-scroll');
        modalBlackScreen.classList.add('hide')
    }
})

function createCard(cardObj) {
    const card = document.createElement('li');
    card.className = `"section__item col-3`;
    card.innerHTML = `
    <div class="card flex ">
    <img src="db/${cardObj.img}" alt="" class="card__img">
    <div class="card__info">
    <h2 class="card__title">${cardObj.name}</h2>
    <p class="card__descr">${cardObj.descr}</p>
    <div class="card__bottom flex">
    <p class="card__price">${cardObj.price} р</p>
    <button id="${cardObj.id}" class="btn btn-reset card__btn">Добавить</button>
    </div>
    </div>
    </div>
    `;
    return card
}

function renderItemsList(itemsDB, list) {
    itemsDB.forEach(el => {
        const card = createCard(el);
        list.appendChild(card)
    })
    makeAddToCartBtn()
}

function sortItemsList(text) {
    const dict = {
        "Пицца" : "pizza",
        "Закуски" : "snack",
        "Коктейли" : "coctail",
        "Кофе" : "coffee",
        "Напитки" : "drink",
        "Десерты" : "dessert",
    }
    allItemPageList.innerHTML = ''
    renderItemsList(allItems.filter(el => el.category === dict[text]), allItemPageList)
}

const sortBtns = document.querySelectorAll('.btn-sort')
sortBtns.forEach(el => el.addEventListener('click', () => {sortItemsList(el.innerHTML)}))


let cart = {
    cartList: getData(),
    cartRenderedList: document.querySelector('.sidebar__list'),

    pushToCart(itemObj) {
        if (this.cartList.find(elem => elem.id === itemObj.id)) {
            this.cartList.find(el => el.id === itemObj.id).count++;
        } else {
            this.cartList.push(itemObj)
        }
        saveData(this.cartList)
    },

    createCartItem(itemObj) {
        const item = document.createElement('li')
        item.className = 'sidebar__item flex in-sidebar'
        item.innerHTML = `
        <p class="sidebar__item__name in-sidebar">${itemObj.name}</p>
        <div class="sidebar__item__wrapper flex in-sidebar">
        <button id="${itemObj.id}" class="sidebar__item__wrapper__btn sidebar-btn btn btn-reset in-sidebar">-</button>
        <p class="sidebar__item__count in-sidebar">${itemObj.count}</p>
        <button id="${itemObj.id}" class="sidebar__item__wrapper__btn sidebar-btn btn btn-reset in-sidebar">+</button>
        </div>
        <p class="sidebar__item__price in-sidebar">${itemObj.count * itemObj.price} Р</p>
        <button id="${itemObj.id}" class="sidebar__delete__btn sidebar-btn btn btn-reset in-sidebar">Удалить</button>
        `
        return item
    },

    clearCartList() {
        while (this.cartRenderedList.firstChild) {
            this.cartRenderedList.removeChild(this.cartRenderedList.firstChild)
        }
    },

    renderCart() {
        this.clearCartList()
        saveData(this.cartList)
        
        if (this.cartList.length) {
            this.cartList.forEach(el => {
                const item = this.createCartItem(el)
                this.cartRenderedList.appendChild(item)
            })

            const countBtns = document.querySelectorAll('.sidebar-btn')
        countBtns.forEach(el => el.addEventListener('click', () => {
            switch(el.innerHTML) {
                case '+':
                    this.plusCount(el.id);
                    break;
                case '-':
                    this.minusCount(el.id)
                    break;
                case 'Удалить':
                    this.deleteCartItem(el.id)
                    break
            }}))

            const totalPrice = document.createElement('li');
            totalPrice.className = 'sidebar__total in-sidebar';
            totalPrice.innerHTML = `
            <p>Итого: ${this.getTotalPrice()} Р</p>
            <button class="sidebar__purshare__btn btn btn-reset in-sidebar">Сделать заказ</button>
            `;
            this.cartRenderedList.appendChild(totalPrice)
            const purshareBtn = document.querySelector('.sidebar__purshare__btn')
            purshareBtn.addEventListener('click', () => {
                if(confirm('Заказ сделан. Начать покупки заново?')) {
                    clearData()
                }
            })
        } else {
            this.cartRenderedList.innerHTML = this.emptyCartHTML
        }
    },

    plusCount(id) {
        this.cartList.find(el => el.id === id).count++
        this.renderCart()
    },

    minusCount(id) {
        const cartObj =  this.cartList.find(el => el.id === id)
        if (cartObj.count == 1) {
            this.deleteCartItem(id)
        } else {
            cartObj.count--
            this.renderCart()
        } 
    },

    deleteCartItem(id) {
        this.cartList = this.cartList.filter(el => el.id != id)
        this.renderCart()
    },

    getTotalPrice() {
        return this.cartList.reduce((t, cur) => t + parseInt(cur.price) * cur.count, 0)
    },

    emptyCartHTML: `<li class="sidebar__item flex in-sidebar">
                    <p class="sidebar__total in-sidebar">Ещё не добавлены товары</p>
                    </li>`
}

function getItemObj(id) {
    const {name, price} = allItems.find(el => el.id == id)
    return {id: id, name: name, price: price, count: 1}
}

function makeAddToCartBtn() {
    cardBtnList = document.querySelectorAll('.card__btn');
    cardBtnList.forEach(el => {
        el.addEventListener('click', () => {
            const itemObj = getItemObj(el.id)
            cart.pushToCart(itemObj)
        })
    })
}

// Взаимодействие с LocalStorage

function saveData(data) {
    const jsonData = JSON.stringify(data);
    localStorage.setItem('cartList', jsonData)
} 

function getData() {
    let storage = localStorage.getItem('cartList');
    return storage ? JSON.parse(storage) : [];
}

function clearData() {
    cart.clearCartList()
    cart.cartList = []
    localStorage.clear()
    cart.cartRenderedList.innerHTML = cart.emptyCartHTML
}
