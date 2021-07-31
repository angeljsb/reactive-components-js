/**
 * Objeto que ayuda a la creación de elementos del DOM
 */
const CustomElement = {
  /**
   * Crea un elemento y le añade atributos
   *
   * @param {string} tagName El nombre de la etiqueta del elemento
   * @param {any} options Un objeto con los atributos que se le
   * desea añadir a la etiqueta html
   * @param {HTMLElement[]} children Un arreglo de elementos
   */
  create: (tagName, options = {}, children = []) => {
    const elemento = document.createElement(tagName);

    for (let key in options) {
      if (elemento[key] !== undefined) {
        elemento[key] = options[key];
      }
    }

    children.forEach((value) => {
      elemento.appendChild(value);
    });

    return elemento;
  },

  /**
   * Convierte un string en formato html en un elemento del DOM
   *
   * @param {string} htmlText El string en formato html
   *
   * @return {HTMLElement} El elemento definido por la primera etiqueta
   * que se abra y se cierre en el string recibido
   */
  fromHTML: (htmlText) => {
    const normalizedText = htmlText.trim().replace(/>\s+</g, "><");
    const div = document.createElement("div");
    div.innerHTML = normalizedText;
    return div.children[0];
  },
};

export default CustomElement;
