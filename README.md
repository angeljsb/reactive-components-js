# reactive-components-js

## Instalación

Descarga la carpeta del último release disponible y añádelo a tu proyecto. Desde el html puedes importarlo con una etiqueta script

```html
<script src="/path/to/reactive.js"></script>
```

Con eso, toda la funcionalidad de la librería estará guardada en nuestro namespace `Reactive`.

## Reactividad

La programación reactiva es un paradigma de programación que se ocupa de los flujos de datos y la propagación de cambios en las vistas. Este paradigma se basa en la capacidad de los "Componentes" para reaccionar a los cambios en los datos.

La unidad básica que nos ayudará a programar reactivamente en javascript son los "Componentes", que pueden ser interpretados como fragmentos de un todo en nuestra aplicación, es decir, los bloques con los que se construye la aplicación. Los componentes deben ser independientes y capaces de comunicarse entre sí, por lo que, normalmente podrán funcionar sin la presencia de otros componentes, pero al mismo tiempo pueden recibir información de otros componentes.

La implementación de los llamados "Componentes reactivos" se basa en la presencia de un "Estado" en los componentes. El "Estado" es el grupo de datos que condiciona la vista de los componente, y al que la vista debe reaccionar cada vez que sean cambiados. Esa reacción es la que vuelve reactivos a nuestros componentes.

## Cómo crear tus propios componentes

La librería Reactive Components te permite crear componentes reactivos a partir de "Plantillas". 
Una plantilla es una función que crea la vista dependiendo del estado actual.

En el siguiente ejemplo crearemos una plantilla de un componente que muestra una etiqueta div con un texto dentro.

```javascript
const html = Reactive.fromHTML;
function template(component){
  const { name } = component.state;
  return html(`<div class="hello-world">Hello ${name}</div>`);
}
```

Leyendo el codigo por linea tenemos que:
- Reactive.fromHTML: Función proveída por la librería que convierte un string en un elemento html. (Es guardada en una constante "html" por comodidad)
- function template(component): Definimos la función plantilla, la cual recibirá el componente en cada renderización. Y deberá devolver el elemento html correspondiente a la vista
- component.state: Por medio de esta sentencia accedemos al estado del componente
- return html(htmlString): Creamos el string html y lo convertimos en un elemento html antes de devolverlo

Ahora, para crear componentes a partir de esta plantilla, se usa la función Reactive.createComponent de la siguiente manera:

```javascript
const HelloWorld = Reactive.createComponent({ 
  template, 
  initialState: { name: "World!!" }
});
```

Esto crea una clase "HelloWorld" con el cual se pueden crear componentes que sigan la plantilla:

```javascript
const hello = new HelloWorld();
//hello será nuestro componente reactivo!!!
```

Por último, solo queda agregar el componente reactivo al DOM:

```javascript
window.addEventListener("DOMContentLoaded", (e) => {
  const container = document.getElementById("hello-container");
  container.appendChild(hello.get());
})
```

Suponiendo que hay un elemento del DOM con el id "hello-container", la vista de nuestro componente reactivo aparecerá dentro de ella

Este componente y todos los que haremos en esta guía están en [este sandbox](https://codesandbox.io/embed/prueba-wiki-reactive-components-d99gb?fontsize=14&hidenavigation=1&theme=dark)

## El estado

El estado es, seguramente, la propiedad más importante de un componente reactivo. Es aquella que define cómo se va a ver e incluso cómo se va a comportar.

El estado puede ser accedido a través de la propiedad "state" de los componentes. Siguiendo con el ejemplo anterior, podriamos acceder al estado de nuestro componente

```javascript
console.log(hello.state);
// Expected: { name: "World!!" }
```

Pero la propiedad "state" es inmutable. Por lo cual no podemos cambiarla simplemente asignándole un valor.
Por ejemplo, el fragmento de código `hello.state = {}` lanza un error.

Entonces, ¿Cómo cambio el estado de mi componente reactivo?

Para eso existe el método `Component.setState(newState)`. Este método recibe un objeto con los nuevos estados. Las llaves que existan en el "state" pero no en el objeto "newState" no serán cambiadas. Del mismo modo, si hay llaves en el objeto newState que no existan en el state, estas serán ignoradas. El método setState solo funciona para cambiar las llaves del state que ya existen, no puede crear nuevas llaves ni borrar existentes.

En nuestro ejemplo se puede cambiar el estado de la siguiente manera.

```javascript
hello.setState({ name: "Angel" });
```

Al ejecutarse esta sentencia podremos ver que el texto de nuestro componente cambia de `Hello World!!` a `Hello Angel`.

También podemos ver lo que pasa al añadir una llave que no existe en el estado:

```javascript
hello.setState({ 
  name: "State", //El texto del componente cambia a "Hello State"
  test: "This should be ignored",
});
console.log(hello.state); //Expected { name: "State" }
```

Pero, ¿Por qué la llave "test" es ignorada y la llave "name" es afectada?

Para responder esta pregunta debemos regresar a la definición de nuestro componente con `createComponent`. Podrás ver que en el objeto de configuración pasamos un parametro `initialState` que tiene una llave "name" con valor "World!!". Desde que definimos así el componente `HelloWorld`, todas las instancias de este tipo tendrán un estado inicial con esa llave y ese valor.

```javascript
const HelloWorld = Reactive.createComponent({ 
  template, 
  initialState: { name: "World!!" } // <- La clave está en esta linea
});
```

Por lo tanto, cada componente de tipo HelloWorld tendrá un state con una única llave llamada "name"

## Añadir eventos

Una de las cosas más complicadas con las que podemos lidiar a la hora de implementar la reactividad en javascript vanilla es la escucha de eventos. Esto de debe a que, al cambiar constantemente la vista, los escucha de eventos que son añadidos a un elemento pueden perderse en cualquier momento. Debido a esto, ejecutar sentencias como `myComponent.element.addEventListener(type, listener)` o `myComponent.get().addEventListener(type, listener)` son una mala práctica.

Con esto en mente, la librería Reactive Components provee metodologías que permiten añadir a los componentes agentes de escucha que no se perderán en los siguientes renderizados. La primera de ellas es añadir los agentes de escucha en la definición del componente como uno de los parámetros de configuración de `Reactive.createComponent()`.

Para ejemplificar, vamos a crear un componente similar al anterior ejemplo pero al cual se le pueda cambiar el nombre con un input.

```javascript
const html = Reactive.fromHTML;
const template = (component) => {
  const { name } = component.state;
  return html(`<div class="input-hello">
    <input type="text" class="input-hello__input" value="${name}" >
    <button class="input-hello__button">Hello ${name}</button>
  </div>`);
};

const InputHello = Reactive.createComponent({
  template,
  initialState: { name: "World!!" },
  events: [{
    type: "change",
    listener: function(e) {
      const newName = e.target.value;
      this.setState({ name: newName });
    },
    selector: ".input-hello__input",
  }],
});
```

Podemos ver que ahora el objeto de configuración que pasamos a createComponent tiene una propiedad "events" la cual recibe un ***arreglo de objetos*** con los agentes de escucha que se vayan a añadir.

Los objetos que se pasan en este arreglo pueden tener tres propiedades:
- type: El tipo de evento. Acepta los mismos que la función EventTarget.addEventListener
- listener: Una función que se ejecutará al activarse el evento. Y recibe el evento como parametro
- selector[opcional]: Un selector que indicará cuál elemento del componente debe activar el evento. Si no se pasa uno, se añade el evento al elemento raíz del componente (Es decir, al elemento html que es devuelto por la función template)

Sabiendo esto, podemos ver que en el ejemplo creamos un tipo de componente InputHello, el cual contiene un input de tipo texto y un botón. Además, vemos que al input se le añade un evento de tipo "change", que cambia el estado "name" por el valor agregado en el input.

Esto significa que al cambiar el texto del input, el texto en el botón también cambiará.

Pero con esta manera de añadir eventos, el evento se añadirá a todas las instancias de InputHello que se cree. Esto es útil para funcionalidad que se va a compartir en todos los componentes iguales. Pero si queremos añadir un evento a un componente en especifico hay que utilizar el método `Component.addEventListener(type, listener[, selector])`.

Para ejemplificar esto supongamos que estamos creando dos componentes de tipo InputHello:

```javascript
const input1 = new InputHello();
const input2 = new InputHello();
```

De este modo, ambos componentes tendrán registrado el evento. Por lo cual el nombre en el botón cambiará al cambiar el texto del input. Ambos componentes son completamente independientes entre sí, por lo que cambiar uno de los inputs solo afectará a su botón y no a los elementos del otro componente.

Ahora, digamos que queremos que el segundo input(input2) reinicie el valor del estado name al dar click en el botón. Y por lo tanto, que el componente muestre el valor inicial ("World!!") tanto en el input de texto como en el botón. Pero esta vez solo queremos que lo haga el componente input2 y no el componente input1.

Para ello, usaremos la función addEventListener:

```javascript
input2.addEventListener(
  "click",
  function (e) {
    input2.setState({ name: "World!!" });
  },
  ".input-hello__button"
);
```

Con esto, al hacer click en el botón del componente (input2), su estado se reiniciará y volverá a tener en el estado el name "World!!"

Ambos componentes están ubicados en la segunda pestaña de [nuestro sandbox](https://codesandbox.io/embed/prueba-wiki-reactive-components-d99gb?fontsize=14&hidenavigation=1&theme=dark)

## Componentes dentro de componentes

Muchas veces nos vamos a topar con componentes que están conformados por un grupo de componentes más específicos o sub-componentes. A la hora de implementar esto nos vamos a encontrar con que requerimos que los sub-componentes existan en el contexto del componente padre y que puedan ser instanciados nuevos sub-componentes al instanciar un componente padre.

Para añadir definiciones a un tipo de componente, usamos la propiedad de configuración `definitions`.

La propiedad definitions puede contener una función. Dicha función se ejecutará en el contexto del componente al instanciarlo, por lo cuál se puede acceder al componente a través de la keyword "this" y por ende leer o escribir propiedades del componente. 
De este modo, la función template del componente podrá acceder a los subcomponentes definidos a través del parámetro "component" que recibe.

Para expresar esto en un ejemplo, vamos a juntar los dos componentes de los ejemplos anteriores en un componente padre:

```javascript
const create = Reactive.createElement; //Función para crear elementos html

const BetterHello = Reactive.createComponent({
  definitions: function () {
    this.input = new InputHello(); //Definimos nuestro subcomponente input
    this.hello = new HelloWorld(); //Definimos nuestro subcomponente hello
  },
  template: function (component) {
    const input = component.input.get(); //Obtenemos el elemento html del componente input
    const hello = component.hello.get(); //Obtenemos el elemento html del componente hello

    return create("div", { className: "better-hello" }, [input, hello]); //Creamos un divider que contenga ambos subcomponentes
  }
});
```

Con esto, podemos instanciar nuestro componente BetterHello el cual, al añadirlo al DOM, mostrará ambos subcomponentes uno encima del otro. 

Como podemos ver, definitions y template son ambos funciones que se ejecutan en el contexto del componente. La diferencia entre ellas radica en que definitions solo se ejecutará una vez (Al instanciar el componente) mientras que template se ejecutará un número indefinido de veces, siempre que haya que renderizar el componente.

Hasta aquí todo funciona, si se ejecuta esto y se añade el componente al DOM podremos ver los dos componentes que hemos creado anteriormente. Pero ambos componentes siguen sin comunicarse entre sí. Es decir, ambos estados serán independientes y modificar un subcomponente no afectará al otro. 

Ahora, supongamos que queremos que al cambiar el texto en el input su valor se muestre en el componente hello. Esto hay dos maneras de hacerlo:
1. Con eventos de estado
2. Con props

### Eventos de estado

Cuando tenemos una instancia de un componente reactivo, nos es posible escuchar desde fuera los cambios en su estado. Esto se hace a través de la función `Component.onChangeState(key, listener)` la cual recibe dos parámetros obligatorios:
- key: Un string con el nombre del estado que se desea escuchar
- listener: Una función que se ejecutará al cambiar dicho estado

También existe una función `Component.onChangeAny(listener)` la cual recibe únicamente el listener y se ejecuta al cambiar cualquiera de los estados del componente. El listener de onChangeAny recibe como primer parámetro un arreglo con los nombres de las propiedades que cambiaron en el estado para provocar que se ejecutara el evento.

En este caso, vamos a usar la primera de estas funciones para escuchar el estado "name" de nuestro componente input y al cambiar este, actualizar el estado "name" del componente hello. En la práctica puede hacerse así

```javascript
const BetterHello = Reactive.createComponent({
  definitions: function () {
    this.input = new InputHello(); //Definimos nuestro subcomponente input
    this.hello = new HelloWorld(); //Definimos nuestro subcomponente hello
    this.input.onChangeState("name", () => {
      this.hello.setState({ name: this.input.state.name });
    });
  },
  template: function (component) { /* Igual que en el fragmento anterior */ }
});
```

Y listo, en la trcera pestaña del [sandbox](https://codesandbox.io/embed/prueba-wiki-reactive-components-d99gb?fontsize=14&hidenavigation=1&theme=dark) podremos apreciar que cada vez que cambiemos el input. El texto abajo de él cambiará también.

### Uso de props

Las props son datos que el componente puede recibir desde un ambiente externo (Dígase su componente padre o la función que lo inserta al DOM). Al igual que el state, las props condicionan el renderizado del componente, la diferencia es que el state es interno del componente e independiente de todo los demás mientras que las props vienen del exterior.

Los componentes normalmente recibirán las props a través del primer parametro de la función `Component.get([props])`. Sí, aquella que hemos usado todo este tiempo para agregar el componente al DOM y a la que no hemos estado pasando ningún parámetro.

El valor de las props puede ser accedido por la función template a través de su parámetro component, con la sentencia `component.props`.

Entonces, ya que ahora nuestros componentes `HelloWorld` e `InputHello` serán subcomponentes tenemos que modificarlos para que en lugar de guardar un nombre en el estado lo reciban a través de las props. Eso lo podemos lograr de la siguiente manera:

```javascript
const html = Reactive.fromHTML;

const HelloWorld = Reactive.createComponent({
  template: function (component) {
    const name = component.props.name || "World!!";
    return html(`<div class="hello-world">Hello ${name}</div>`);
  }
});

const InputHello = Reactive.createComponent({
  template: function (component) {
    const name = component.props.name || "World!!";
    return html(`<div class="input-hello">
      <input type="text" class="input-hello__input" value="${name}" >
      <button class="input-hello__button">Reset</button>
    </div>`); // Cambiamos el texto del botón a "Reset" para que sea más acorde a su nueva función
  }
});
```

Luego, necesitamos que la propiedad name sea contenida en el estado de nuestro componente padre y que este lo comparta con sus subcomponentes. Eso lo hacemos de la siguiente manera:

```javascript
const BetterHello = Reactive.createComponent({
  initialState: { name: "World!!" },
  definitions: function () {
    this.input = new InputHello(); //Definimos nuestro subcomponente input
    this.hello = new HelloWorld(); //Definimos nuestro subcomponente hello
    this.input.addEventListener(
      "change",
      (e) => {
        this.setState({ name: e.target.value });
      },
      ".input-hello__input"
    );
    this.input.addEventListener(
      "click",
      (e) => {
        this.setState({ name: "World!!" });
      },
      ".input-hello__button"
    );
  },
  template: function (component) {
    const input = component.input.get({ name: component.state.name });
    const hello = component.hello.get({ name: component.state.name });

    return create("div", { className: "better-hello" }, [input, hello]);
  }
});
```

Podemos ver que este objeto tiene un estado inicial `{ name: "World!!" }` y que en definitions se añaden dos agentes de escucha a `this.input`. Uno al campo de texto que cambia el estado del componente por el proveído por el usuario y otro al botón, que reinicia el valor del estado name a "World!!"

Podemos ver que en este pequeño componente aplicamos casi todos los conceptos que hemos visto durante este tutorial. 

Como siempre, el componente resultante se puede ver en [el sandbox](https://codesandbox.io/embed/prueba-wiki-reactive-components-d99gb?fontsize=14&hidenavigation=1&theme=dark), ubicado en la pestaña final.
