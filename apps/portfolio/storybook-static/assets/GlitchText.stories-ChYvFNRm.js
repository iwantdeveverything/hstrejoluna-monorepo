import{j as r}from"./jsx-runtime-B-1wRJft.js";import{G as s}from"./useReducedMotion-DMHckXoT.js";import"./iframe-BrKxg2xT.js";import"./preload-helper-PPVm8Dsz.js";import"./TelemetryHUD-BIPvxtqD.js";const x={title:"UI/GlitchText",component:s,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{text:{control:"text"},active:{control:"boolean"}}},t={args:{text:"SYSTEM_ONLINE"},render:a=>r.jsx("div",{className:"bg-void p-12 flex justify-center text-4xl font-black text-white italic",children:r.jsx(s,{...a})})},e={args:{text:"CRITICAL_ERROR",active:!0},render:a=>r.jsx("div",{className:"bg-void p-12 flex justify-center text-4xl font-black text-error italic",children:r.jsx(s,{...a})})};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  args: {
    text: "SYSTEM_ONLINE"
  },
  render: args => <div className="bg-void p-12 flex justify-center text-4xl font-black text-white italic">
      <GlitchText {...args} />
    </div>
}`,...t.parameters?.docs?.source}}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    text: "CRITICAL_ERROR",
    active: true
  },
  render: args => <div className="bg-void p-12 flex justify-center text-4xl font-black text-error italic">
      <GlitchText {...args} />
    </div>
}`,...e.parameters?.docs?.source}}};const d=["Default","ActiveGlitch"];export{e as ActiveGlitch,t as Default,d as __namedExportsOrder,x as default};
