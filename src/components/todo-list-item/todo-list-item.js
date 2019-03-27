import React, { Component } from 'react';
import './todo-list-item.css';

export default class TodoListItem extends Component {

  // constructor() {
  //   super();
  //   this.state = {
  //     done:false;
  //   }

  //   this.onLabelClick = () => {
  //     console.log(`Done ${this.props.label}`);
  //   }
  // }

  state = {
    done:false,
    important: false,
  }

  render () {
    const {label, onDeleted,
          onToggleDone,
          onToggleImportant,
          done, important } = this.props;

    let classNames = 'todo-list-item';
    if (done) {
      classNames += ' done';
    }

    if (important) {
      classNames += ' important';
    }

  	return (
      <span className={classNames}>
        <span
          className="todo-list-item-label"
          onClick={onToggleDone}>
          {label}
        </span>

        <button
          onClick={onToggleImportant}
          type="button"
          className="btn btn-outline-success btn-sm">
            <i className="fa fa-exclamation" />
        </button>
        <button
          onClick={onDeleted}
          type="button"
          className="btn btn-outline-success btn-sm">
            <i className="fa fa-trash-o" />
        </button>
      </span>
    );
  }
}
