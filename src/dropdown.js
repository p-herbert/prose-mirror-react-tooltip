import React, { Component } from 'react';
import ReactDOM from 'react-dom';

export class DropdownWrapper {
    constructor({view, DropDownComponent}) {
        this.DropDownComponent = DropDownComponent;
        this.dropdownEl = document.createElement('div');
        view.dom.parentNode.appendChild(this.dropdownEl);
    }
    show(view) {
        const Dropdown = this.DropDownComponent;
        ReactDOM.render(<Dropdown view={view} />, this.dropdownEl);
    }
    hide() {
        ReactDOM.unmountComponentAtNode(this.dropdownEl);
    }
    update(view, text, range) {
        const Dropdown = this.DropDownComponent;
        ReactDOM.render(<Dropdown view={view} text={text} range={range} />, this.dropdownEl);
    }
}

