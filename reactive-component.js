import EffectHandler from "./effect-handler.js";

const _state = (state = {}) => {
  let s = { ...state };
  return {
    value: () => JSON.parse(JSON.stringify(s)),
    change: (key, value) => {
      if (s.hasOwnProperty(key)) {
        const prev = s[key];
        s[key] = value;
        return prev !== value;
      }
      return false;
    },
  };
};

/**
 * Define un componente reactivo
 * @param {Node} element El elemento padre del componente
 * @param {any} state El estado inicial del componente reactivo
 * @param {(props:any)=>HTMLElement} template Función que devuelve un
 * elemento html condicionado por el estado y props actuales, el cual será
 * renderizado cada vez que estos cambien
 */
function ReactiveComponent(template, initState = {}) {
  this._state = _state(initState);
  this.props = {};
  if (template) this.template = template.bind(this);
  this.element = this.template(this.props);
  this.sideEffects = EffectHandler();
}

ReactiveComponent.prototype = {
  constructor: ReactiveComponent,

  /**
   * Función para cambiar el estado de un componente reactivo.
   * Recibe un objeto el cual alguna de sus llaves debe coincidir con
   * uno de los estados, de ser así, actualiza el estado y vuelve a
   * renderizar el dom en base a el
   *
   * @param {any} newState Un objeto con los estados a cambiar.
   */
  setState: function (newState) {
    const keys = Object.keys(newState);

    const changed = keys.filter((key) =>
      this._state.change(key, newState[key])
    );

    changed.forEach(this.sideEffects.dispatchIgnoreGlobals);

    if (changed.length > 0) {
      this.sideEffects.dispatchGlobals(changed);
      this.render();
    }
  },

  /**
   * Función que renderiza el dom según la devolución de template
   */
  render: function () {
    const newTemp = this.template(this.props);

    if (!this.element.isEqualNode(newTemp)) {
      this.element.replaceWith(newTemp);
      this.element = newTemp;
    }
  },

  /**
   * Añade una función que se activa al cambiar un estado del componente
   *
   * @param {string} key El nombre del estado
   * @param {()=>void} action La función que se ejecutará al cambiar el
   * estado.
   */
  onChangeState: function (key, action) {
    this.sideEffects.add(key, action);
  },

  /**
   * Añade una función que se ejecuta al cambiar cualquier estado.
   *
   * De cambiar varios estados, esta función se ejecuta para cada uno.
   *
   * @param {(key:string[])=>void} action La función que se ejecutará en cada
   * cambio de estado
   */
  onChangeAny: function (action) {
    this.sideEffects.addGlobal(action);
  },

  /**
   * Remueve una o todas las funciones añadidas como efectos secundarios
   * por onChangeState
   *
   * @param {string} key El nombre del estado al cual remover el efecto
   * @param {()=>void | false} action La acción a remover. De no pasarse
   * este parametro o pasar false, se eliminarán todos los efectos
   * secundarios para ese estado
   *
   * @return {boolean} Si se removió algún efecto
   */
  offChangeState: function (key, action = false) {
    return this.sideEffects.remove(key, action);
  },

  /**
   * Remueve una o todas las funciones añadidas como efectos secundarios
   * globales por onChangeAny
   *
   * @param {(key:string)=>void | false} action La función a remover de los
   * efectos secundarios. De no pasarse este parametro o pasar false se
   * removeran todos los efectos secundarios globales
   */
  offChangeAny: function (action = false) {
    return this.sideEffects.removeGlobal(action);
  },

  get: function (props = {}) {
    this.props = { ...props };

    this.render();

    return this.element;
  },

  /**
   * El estado solo se puede definir una vez. De intentar sobreescribirlo
   * lanzará un error
   */
  set state(state) {
    throw new Error("The state is inmutable");
  },

  /**
   * Devuelve una copia inmutable del estado
   */
  get state() {
    return this._state.value();
  },
};

/**
 *
 * @param {(props?:any) => HTMLElement} template Una función plantilla
 * que recibe un objeto props y tiene acceso a this.state, y debe basarse
 * en ellas para crear un html element que será lo que se renderizará como
 * element
 * @param {*} initState El estado inicial de todos los objetos de la clase
 * devuelta
 * @param {*} extra Campos extra que se van a añadir a los objetos de
 * la nueva clase. Sí es una función, esta se ejecutará en el
 * contexto del constructor de la nueva clase
 * @returns {Function} Un constructor del componente reactivo asociado
 * al template y el state pasados. Este constructor recibe un objeto
 * props y renderiza un elemento en base a dicho objeto y al estado
 */
const componentFromTemplate = (template, initState = {}, extra = {}) => {
  function _Comp(config = {}) {
    if (extra) {
      if (extra instanceof Function) {
        extra.call(this);
      } else {
        const ex = { ...extra };
        for (let i in ex) {
          this[i] = ex[i];
        }
      }
    }
    this.config = config;

    ReactiveComponent.call(this, null, initState);
  }
  _Comp.prototype = Object.create(ReactiveComponent.prototype);
  _Comp.prototype.template = template;
  _Comp.prototype.constructor = _Comp;

  return _Comp;
};

export { componentFromTemplate };

export default ReactiveComponent;
