import{j as t}from"./jsx-runtime-B-1wRJft.js";import{T as a}from"./TelemetryHUD-BIPvxtqD.js";import"./iframe-BrKxg2xT.js";import"./preload-helper-PPVm8Dsz.js";const d={title:"UI/TelemetryHUD",component:a,parameters:{layout:"centered"},tags:["autodocs"],argTypes:{identifier:{control:"text"},status:{control:"text"},dateRange:{control:"text"}}},e={args:{identifier:"maestros-del-salmon",status:"PROD_LIVE",techStack:["Next.js","TailwindCSS","Framer Motion"]},render:s=>t.jsx("div",{className:"bg-void p-12 w-[400px]",children:t.jsx(a,{...s})})},r={args:{identifier:"TechCorp Inc.",status:"ACTIVE_OPS",dateRange:"2024.01 // PRESENT"},render:s=>t.jsx("div",{className:"bg-void p-12 w-[400px]",children:t.jsx(a,{...s})})};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:`{
  args: {
    identifier: "maestros-del-salmon",
    status: "PROD_LIVE",
    techStack: ["Next.js", "TailwindCSS", "Framer Motion"]
  },
  render: args => <div className="bg-void p-12 w-[400px]">
      <TelemetryHUD {...args} />
    </div>
}`,...e.parameters?.docs?.source}}};r.parameters={...r.parameters,docs:{...r.parameters?.docs,source:{originalSource:`{
  args: {
    identifier: "TechCorp Inc.",
    status: "ACTIVE_OPS",
    dateRange: "2024.01 // PRESENT"
  },
  render: args => <div className="bg-void p-12 w-[400px]">
      <TelemetryHUD {...args} />
    </div>
}`,...r.parameters?.docs?.source}}};const m=["ProjectContext","ExperienceContext"];export{r as ExperienceContext,e as ProjectContext,m as __namedExportsOrder,d as default};
