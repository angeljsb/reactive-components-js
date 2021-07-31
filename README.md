# reactive-components-js

Libreria para crear componentes reactivos en javascript vanilla.

Se basa en la implementación de un objeto <b>ReactiveComponent</b>, el cual posee una función <b>template</b> y una propiedad <b>state</b>.
La función <b>template</b> debe generar un elemento de DOM condicionado por el <b>state</b>. Cada vez que el <b>state</b> cambie, el elemento será
renderizado nuevamente según la devolución de <b>template</b>
