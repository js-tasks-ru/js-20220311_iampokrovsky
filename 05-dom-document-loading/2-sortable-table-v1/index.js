export default class SortableTable {
  element;
  subElements = {};

  constructor(headerConfig = [], data = []) {
    this.headerConfig = [...headerConfig];
    this.data = [...Array.isArray(data) ? data : data.data];

    this.render();
  }

  getTableTemplate() {
    return `
      <div data-element="productsContainer" class="products-list__container">
        ${this.getHeader()}
        ${this.getBody()}
      </div>
    `;
  }

  getHeader() {
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${this.headerConfig.map(item => this.getHeaderCol(item)).join('')}
      </div>
    `;
  }

  getHeaderCol({id, title, sortable = false}) {
    const sortArrowTemplate = `
      <span data-element="arrow" class="sortable-table__sort-arrow">
        <span class="sort-arrow"></span>
      </span>
    `;

    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        ${sortable ? sortArrowTemplate : ''}
      </div>
    `;
  }

  getBody() {
    return `
      <div data-element="body" class="sortable-table__body">
        ${this.getBodyRows()}
      </div>
    `;
  }

  getBodyRows() {
    return this.data.map(item => {
      return `<a href="/products/${item.id}" class="sortable-table__row">${this.getBodyRow(item)}</a>`;
    }).join('');
  }

  getBodyRow(item) {
    return this.headerConfig.map(({id: field, template}) => {
      return template ? template(item[field]) : `<div class="sortable-table__cell">${item[field]}</div>`;
    }).join('');
  }

  render() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.getTableTemplate();
    this.element = wrapper.firstElementChild;
    this.subElements = this.getSubElements();
  }

  getSubElements() {
    const result = {};
    const elements = this.element.querySelectorAll('[data-element]');

    for (const subElement of elements) {
      const name = subElement.dataset.element;

      result[name] = subElement;
    }

    return result;
  }

  update(field, order) {
    const headerColumns = this.subElements.header.querySelectorAll('[data-id]');
    headerColumns.forEach(item => {
      item.dataset.order = (item.dataset.id === field) ? order : '';
    });

    this.subElements.body.innerHTML = this.getBodyRows();
  }

  sort(field, order = 'asc') {
    const fieldConfig = this.headerConfig.find(item => item.id === field);
    const {sortable, sortType} = fieldConfig;
    const direction = {
      'asc': 1,
      'desc': -1
    }[order];

    if (sortable && sortType) {
      this.data.sort((a, b) => {
        switch (sortType) {
        case 'number':
          return direction * (a[field] - b[field]);
        case 'string':
          return direction * a[field].localeCompare(b[field], ['ru', 'en']);
        }
      });

      this.update(field, order);
    }
  }

  remove() {
    this.element?.remove();
  }

  destroy() {
    this.remove();
    this.element = null;
    this.subElements = {};
  }
}
