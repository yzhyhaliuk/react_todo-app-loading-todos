/* eslint-disable jsx-a11y/label-has-associated-control */
/* eslint-disable jsx-a11y/control-has-associated-label */
import React, { useEffect, useRef, useState } from 'react';
import { UserWarning } from './UserWarning';
import { getTodos, updateTodo, USER_ID } from './api/todos';
import { Todo } from './types/Todo';
import classNames from 'classnames';

export const App: React.FC = () => {
  const [todos, setTodos] = useState<Todo[] | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [updatingTodoId, setUpdatingTodoId] = useState<number | null>(null);
  const [allTodos, setAllTodos] = useState<Todo[] | null>(null);
  const [activeFilter, setActivefilter] = useState<string>('all');

  const inputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    getTodos()
      .then(todosFromServer => {
        setTodos(todosFromServer);
        setAllTodos(todosFromServer);
        setErrorMessage('');
        inputRef.current?.focus();
      })
      .catch(() => {
        setErrorMessage('Unable to load todos');
        setTimeout(() => {
          setErrorMessage('');
        }, 3000);
      });
  }, []);

  const toggleTodo = async (id: number) => {
    setUpdatingTodoId(id);
    const todoToUpdate = todos?.find(todo => todo.id === id);

    if (!todoToUpdate) {
      return;
    }

    try {
      await updateTodo(id, { completed: !todoToUpdate.completed });
      setTodos(prevTodos =>
        (prevTodos as Todo[]).map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
      setAllTodos(prevTodos =>
        (prevTodos as Todo[]).map(todo =>
          todo.id === id ? { ...todo, completed: !todo.completed } : todo,
        ),
      );
    } catch {
      setErrorMessage('Unable to update a todo');
    } finally {
      setUpdatingTodoId(null);
    }
  };

  function handleFilter(filterType: string) {
    let filteredTodos;

    setActivefilter(filterType);

    switch (filterType) {
      case 'all': {
        filteredTodos = allTodos;
        break;
      }

      case 'active': {
        filteredTodos = allTodos?.filter(todo => !todo.completed);
        break;
      }

      case 'completed': {
        filteredTodos = allTodos?.filter(todo => todo.completed);
        break;
      }

      default: {
        filteredTodos = allTodos?.filter(todo => !todo.completed);
      }
    }

    if (filteredTodos) {
      setTodos(filteredTodos);
    }
  }

  if (!USER_ID) {
    return <UserWarning />;
  }

  const completedCount = todos?.filter(todo => todo.completed).length;

  // eslint-disable-next-line no-console
  console.log('Completed count:', completedCount);

  return (
    <div className="todoapp">
      <h1 className="todoapp__title">todos</h1>

      <div className="todoapp__content">
        <header className="todoapp__header">
          {/* this button should have `active` class only if all todos are completed */}
          <button
            type="button"
            className={classNames('todoapp__toggle-all', {
              active: todos?.filter(todo => !todo.completed).length === 0,
            })}
            data-cy="ToggleAllButton"
          />

          {/* Add a todo on form submit */}
          <form>
            <input
              data-cy="NewTodoField"
              type="text"
              className="todoapp__new-todo"
              placeholder="What needs to be done?"
              ref={inputRef}
            />
          </form>
        </header>

        <section className="todoapp__main" data-cy="TodoList">
          {todos?.map(todo => (
            <div
              key={todo.id}
              data-cy="Todo"
              className={classNames('todo', { completed: todo.completed })}
            >
              <label className="todo__status-label">
                <input
                  data-cy="TodoStatus"
                  type="checkbox"
                  className="todo__status"
                  onChange={() => toggleTodo(todo.id)}
                  checked={todo.completed}
                />
              </label>
              {updatingTodoId === todo.id ? (
                <form>
                  <input
                    data-cy="TodoTitleField"
                    type="text"
                    className="todo__title-field"
                    placeholder="Empty todo will be deleted"
                    value="Todo is being edited now"
                  />
                </form>
              ) : (
                <>
                  <span data-cy="TodoTitle" className="todo__title">
                    {todo.title}
                  </span>

                  {/* Remove button appears only on hover */}
                  <button
                    type="button"
                    className="todo__remove"
                    data-cy="TodoDelete"
                  >
                    ×
                  </button>
                </>
              )}

              {/* overlay will cover the todo while it is being deleted or updated */}
              <div
                data-cy="TodoLoader"
                className={classNames('modal overlay', {
                  'is-active': updatingTodoId === todo.id,
                })}
              >
                <div className="modal-background has-background-white-ter" />
                <div className="loader" />
              </div>
            </div>
          ))}

          {/* This is a completed todo */}
          {/* <div data-cy="Todo" className="todo completed">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
                checked
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Completed Todo
            </span>

            {/* Remove button appears only on hover */}
          {/* <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button> */}

          {/* overlay will cover the todo while it is being deleted or updated */}
          {/* <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}

          {/* This todo is an active todo */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Not Completed Todo
            </span>
            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}

          {/* This todo is being edited */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label> */}

          {/* This form is shown instead of the title and remove button */}
          {/* <form>
              <input
                data-cy="TodoTitleField"
                type="text"
                className="todo__title-field"
                placeholder="Empty todo will be deleted"
                value="Todo is being edited now"
              />
            </form>

            <div data-cy="TodoLoader" className="modal overlay">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}

          {/* This todo is in loadind state */}
          {/* <div data-cy="Todo" className="todo">
            <label className="todo__status-label">
              <input
                data-cy="TodoStatus"
                type="checkbox"
                className="todo__status"
              />
            </label>

            <span data-cy="TodoTitle" className="todo__title">
              Todo is being saved now
            </span>

            <button type="button" className="todo__remove" data-cy="TodoDelete">
              ×
            </button> */}

          {/* 'is-active' class puts this modal on top of the todo */}
          {/* <div data-cy="TodoLoader" className="modal overlay is-active">
              <div className="modal-background has-background-white-ter" />
              <div className="loader" />
            </div>
          </div> */}
        </section>

        {/* Hide the footer if there are no todos */}
        {(allTodos ?? []).length > 0 && (
          <>
            <footer className="todoapp__footer" data-cy="Footer">
              <span className="todo-count" data-cy="TodosCounter">
                {(allTodos ?? []).filter(todo => !todo.completed).length} items
                left
              </span>

              {/* Active link should have the 'selected' class */}
              <nav className="filter" data-cy="Filter">
                <a
                  href="#/"
                  className={classNames('filter__link', {
                    selected: activeFilter === 'all',
                  })}
                  data-cy="FilterLinkAll"
                  onClick={() => handleFilter('all')}
                >
                  All
                </a>

                <a
                  href="#/active"
                  className={classNames('filter__link', {
                    selected: activeFilter === 'active',
                  })}
                  data-cy="FilterLinkActive"
                  onClick={() => handleFilter('active')}
                >
                  Active
                </a>

                <a
                  href="#/completed"
                  className={classNames('filter__link', {
                    selected: activeFilter === 'completed',
                  })}
                  data-cy="FilterLinkCompleted"
                  onClick={() => handleFilter('completed')}
                >
                  Completed
                </a>
              </nav>

              {/* this button should be disabled if there are no completed todos */}
              <button
                type="button"
                className="todoapp__clear-completed"
                data-cy="ClearCompletedButton"
                disabled={
                  (todos ?? []).filter(todo => todo.completed).length === 0
                }
              >
                Clear completed
              </button>
            </footer>
          </>
        )}
      </div>

      {/* DON'T use conditional rendering to hide the notification */}
      {/* Add the 'hidden' class to hide the message smoothly */}
      <div
        data-cy="ErrorNotification"
        className={classNames(
          'notification is-danger is-light has-text-weight-normal',
          { hidden: !errorMessage },
        )}
      >
        <button
          data-cy="HideErrorButton"
          type="button"
          className="delete"
          onClick={() => setErrorMessage('')}
        />
        {/* show only one message at a time */}
        {errorMessage}
        {/* <br />
        Title should not be empty
        <br />
        Unable to add a todo
        <br />
        Unable to delete a todo
        <br />
        Unable to update a todo */}
      </div>
    </div>
  );
};
