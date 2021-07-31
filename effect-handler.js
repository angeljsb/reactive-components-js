const EffectHandler = () => {
  const al = {};
  const globals = [];

  /**
   * Añade una acción a una llave. Al activar dicha llave, todos
   * los efectos secundarios añadidos a ella se activan.
   *
   * @param {string} key La llave a la que añadir la acción
   * @param {()=>void} action Acción a ejecutar al cambiar
   * el estado
   */
  const add = (key, action) => {
    if (!action instanceof Function)
      throw TypeError("action is not a function");
    if (!al[key]) {
      al[key] = [];
    }
    al[key].push(action);
  };
  /**
   * Añade un efecto secundario que se activa sin importar a cual de las
   * llaves corresponda la llamada.
   *
   * @param {(key: string) => void} action La acción a añadir
   */
  const addGlobal = (action) => {
    if (!action instanceof Function)
      throw TypeError("action is not a function");
    globals.push(action);
  };
  /**
   * Remueve un efecto secundario que dejará de activarse al despachar
   * su llave.
   *
   * Si no se pasa una acción, se remueven todas las acciones para dicha
   * llave
   *
   * @param {string} key El nombre de la llave en la que está ese efecto
   * @param {()=>void | false} action Acción que se desea remover
   *
   * @return {boolean} Si la acción fue removida correctamente
   */
  const remove = (key, action = false) => {
    if (!al[key]) {
      return false;
    }
    if (!action) {
      al[key] = [];
      return true;
    }
    const i = al[key].indexOf(action);
    if (i > -1) {
      al[key].splice(i, 1);
      return true;
    }
    return false;
  };
  /**
   * Remueve una acción global, que dejará de ejecutarse al llamar
   * cualquier llave.
   *
   * @param {(key: string)=>boolean | false}  action La acción global a
   * remover. Si no se añade una, remuve todas las acciones globales
   *
   * @return {boolean} Si se pudo remover alguna acción
   */
  const removeGlobal = (action = false) => {
    if (!action) {
      const rem = globals.splice(0);
      return rem.length > 0;
    }
    const i = globals.indexOf(action);
    if (i > -1) {
      globals.splice(i, 1);
      return true;
    }
    return false;
  };
  /**
   * Activa los events globales
   *
   * @param {string} key La llave que activó los efectos globales si la
   * hay
   */
  const dispatchGlobals = (key = "") => {
    globals.forEach((funct) => funct(key));
  };
  /**
   * Activa los eventos correspondientes a una llave, evitando la
   * activación de los eventos globales
   *
   * @param {string} key La llave cuyos efectos se activarán
   */
  const dispatchIgnoreGlobals = (key) => {
    if (al[key]) {
      al[key].forEach((funct) => funct());
    }
  };
  /**
   * Activa todos los eventos correspondientes a una llave y los globales
   * como efectos secundarios de las mismas
   *
   * Es el metodo normal para activar las funciones relacionadas a una
   * llave
   *
   * @param {string} key La llave
   */
  const dispatch = (key = null) => {
    dispatchIgnoreGlobals(key);

    dispatchGlobals(key);
  };

  return {
    add,
    addGlobal,
    remove,
    removeGlobal,
    dispatchGlobals,
    dispatchIgnoreGlobals,
    dispatch,
  };
};

export default EffectHandler;
