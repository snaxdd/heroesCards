"use strict";

class HeroApp {
  constructor(src) {
    this.src = src;
    this.heroCards = [];
    this.currentHeroes = [];
    this.sortCollect = {};
    this.cardRow = document.querySelector('.cards-container > .row');
    this.selectName = document.getElementById('sort-name');
    this.selectValue = document.getElementById('sort-value');
    this.sortBx = document.querySelector('.sort-films');
    this.heroCount = document.getElementById('hero-count');
  }

  init() {
    this.currentHeroes = [...this.heroCards];
    this.createSortValues(this.currentHeroes);
    this.insertSortValues();
    this.loadCards(this.heroCards);
    this.heroInfoEvents();
  }

  loadData(callback) {
    fetch(this.src)
      .then((response) => {
        if (response.status !== 200) {
          throw new Error(`>> ${response.status} - ${response.statusText}`);
        }

        return response.json();
      })
      .then((response) => {
        this.heroCards = [...response];
        callback();
      })
      .catch((error) => {
        console.error(`>> ${error}`);
      });
  }

  createHeroCard(hero) {
    const cardBox = document.createElement('div');
    cardBox.className = 'col-lg-3 col-md-4 col-sm-6';


    cardBox.insertAdjacentHTML('beforeend', `<div class="hero-card">
    <div class="hero-card__all-info">
        <div class="wrap">
        <table class="hero-card__table">
          
        </table>
        </div>
        <div class="hero-card__more-info-close-btn">
            <img src="icons/close.svg" alt="close">
        </div>
        <div class="hero-card__more-info-btn">
            <img src="icons/menu.svg" alt="arrow">
        </div>
    </div>
    <div class="hero-info">
        <h3 class="hero-info__name">${hero.name}</h3>
        <span class="hero-info__status hero-info__status-${hero.status}">${hero.status}</span>
        <span class="hero-info__actor">${hero.actors}</span>
    </div>
    <img class="hero-card__background" src="${hero.photo}"
        alt="${hero.name}">
    </div>`);


    for (const item in hero) {
      const cardFace = ['name', 'status', 'actors', 'photo'];

      if (!cardFace.includes(item)) {
        cardBox.querySelector('.hero-card__table').insertAdjacentHTML('beforeend',
          `<tr>
                <th>${item}</th>
            </tr>
            <tr>
                <td>${hero[item]}</td>
          </tr>`);
      }
    }

    return cardBox;
  }

  openAnimation({ timing, draw, duration }) {
    let start = performance.now();

    const requestId = requestAnimationFrame(function animate(time) {
      let timeFraction = (time - start) / duration;

      if (timeFraction > 1) {
        timeFraction = 1;
      }

      let progress = timing(timeFraction);

      draw(progress);

      if (timeFraction < 1) {
        requestAnimationFrame(animate);
      }

      cancelAnimationFrame(requestId);
    });
  }

  heroInfoEvents() {
    this.cardRow.addEventListener("click", (event) => {
      const target = event.target;

      if (target.closest('.hero-card__more-info-btn')) {
        this.openAnimation({
          timing: (timeFraction) => {
            return timeFraction;
          },
          draw: (progress) => {
            target.closest('.hero-card__all-info').style.top = `-${100 - (100 * Math.pow(progress, 2))}%`;
          },
          duration: 400
        });
      } else if ((target.closest('.hero-card__more-info-close-btn'))) {
        this.openAnimation({
          timing: (timeFraction) => {
            return timeFraction;
          },
          draw: (progress) => {
            target.closest('.hero-card__all-info').style.top = `-${0 + (100 * Math.pow(progress, 2))}%`;
          },
          duration: 400
        });
      }
    });

    this.sortBx.addEventListener('change', (event) => {
      const target = event.target;
      
      const changeValues = (target) => {
        this.selectValue.textContent = "";
        this.selectValue.insertAdjacentHTML('beforeend',
          `<option class="default-option" selected disabled value="disabled-default">Опция</option>`);
        this.sortCollect[target.value].forEach(item => {
          this.selectValue.insertAdjacentHTML('beforeend', `<option value="${item}">${item}</option>`);
        });
      };
      
      if (target.id === 'sort-name') {
        if (Object.keys(this.sortCollect).includes(target.value)) {
          changeValues(target);
          this.filterCards(this.selectName.value, this.selectValue.value);
          this.loadCards(this.currentHeroes);
        } else if (target.value.toLowerCase() === 'all-heroes') {
          this.selectValue.innerHTML = `<option class="default-option" 
          selected disabled value="disabled-default">Опция</option>`;
          this.loadCards(this.heroCards);
        }
      } else if (target.id === 'sort-value') {
        this.filterCards(this.selectName.value, this.selectValue.value);
        this.loadCards(this.currentHeroes);
      }
    });
  }

  filterCards(filterKey, filterValue) {
    this.cardRow.textContent = "";
    this.currentHeroes = [];

    for (const item of this.heroCards) {
      if (Object.keys(item).includes(filterKey)) {
        if (item[filterKey] === filterValue) {
          this.currentHeroes.push(item);
        } else if (Array.isArray(item[filterKey])) {
          if (item[filterKey].includes(filterValue)) {
            this.currentHeroes.push(item);
          }
        }
      }
    }
  }

  createSortValues(item) {
    const values = ['movies', 'status', 'species'];

    values.forEach((item) => {
      this.sortCollect[item] = new Set();
    });

    item.forEach(currentItem => {
      for (const key in currentItem) {
        if (Object.keys(this.sortCollect).includes(key)) {
          if (Array.isArray(currentItem[key])) {
            this.sortCollect[key].add(...currentItem[key]);
          } else {
            this.sortCollect[key].add(currentItem[key]);
          }
        }
      }
    });
  }

  insertSortValues() {
    for (const item in this.sortCollect) {
      this.selectName.insertAdjacentHTML('beforeend', `<option value="${item}">${item}</option>`);
    }

    this.selectName.insertAdjacentHTML('beforeend', `<option value="All-heroes">All heroes</option>`);
  }

  loadCards(cards) {
    this.cardRow.textContent = "";

    for (const item of cards) {
      this.cardRow.append(this.createHeroCard(item));
    }

    this.heroCount.textContent = cards.length;
  }
}

const init = new HeroApp('../json/dbHeroes.json');
init.loadData(() => {
  init.init();
});

