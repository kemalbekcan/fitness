console.log('button/index.js dsad');
console.log('hello 2');
// class BaseButton extends HTMLElement {
//     constructor() {
//         super();
        
//         this.button = this.attachShadow({ mode: 'open' });
//         console.log('BaseButton constructor');
//     }

//     connectedCallback() {
//         console.log('BaseButton connectedCallback');

//         this.render();
//     }

//     attributeChangedCallback() {
//         console.log('BaseButton attributeChangedCallback');
//     }

//     adoptedCallback() {
//         console.log('BaseButton adoptedCallback');
//     }
    
//     disconnectedCallback() {
//         console.log('BaseButton disconnectedCallback');
//     }

//     render() {
//         this.button.innerHTML = `
//         <button class="btn btn-primary">Primary</button>
//         `;
//     }
// }

// customElements.define('base-button', BaseButton);