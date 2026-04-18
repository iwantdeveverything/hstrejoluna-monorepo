import{j as d}from"./jsx-runtime-B-1wRJft.js";import{a as u}from"./iframe-BrKxg2xT.js";import{u as f,a as S}from"./useReducedMotion-DMHckXoT.js";import"./TelemetryHUD-BIPvxtqD.js";import{n as v,s as b}from"./navigation-C58ziVEb.js";import"./preload-helper-PPVm8Dsz.js";const g=["projects","experience","skills","certificates"],h=[{id:"projects",label:"Projects",shortLabel:"Projects"},{id:"experience",label:"Experience",shortLabel:"Experience"},{id:"skills",label:"Skills",shortLabel:"Skills"},{id:"certificates",label:"Certificates",shortLabel:"Certificates"}],r=({activeId:s,counts:o,socials:n,hideOnScroll:c=!1})=>{const l=f(),m=u.useMemo(()=>v(n),[n]),p=i=>{g.includes(i)&&b({id:i,reducedMotion:l})};return d.jsx(S,{activeId:s,counts:o,sections:h,socials:m,hideOnScroll:c,onSectionNavigate:p})};r.__docgenInfo={description:"",methods:[],displayName:"CommandNav",props:{activeId:{required:!0,tsType:{name:"union",raw:'StreamSectionId | ""',elements:[{name:"StreamSectionId"},{name:"literal",value:'""'}]},description:""},counts:{required:!0,tsType:{name:"CommandNavCounts"},description:""},socials:{required:!1,tsType:{name:"Array",elements:[{name:"ProfileSocialLink"}],raw:"ProfileSocialLink[]"},description:""},hideOnScroll:{required:!1,tsType:{name:"boolean"},description:"",defaultValue:{value:"false",computed:!1}}}};const{userEvent:x,within:k}=__STORYBOOK_MODULE_TEST__,O={title:"UI/CommandNav",component:r,args:{activeId:"projects",counts:{projects:4,experience:2,certificates:3},socials:[{platform:"github",url:"https://github.com/example",label:"GitHub"},{platform:"linkedin",url:"https://linkedin.com/in/example",label:"LinkedIn"},{platform:"email",email:"dev@example.com",label:"Email"}]}},e={},a={args:{socials:[]}},t={play:async({canvasElement:s})=>{const o=k(s);await x.click(o.getByRole("button",{name:/open navigation menu/i}))}};e.parameters={...e.parameters,docs:{...e.parameters?.docs,source:{originalSource:"{}",...e.parameters?.docs?.source}}};a.parameters={...a.parameters,docs:{...a.parameters?.docs,source:{originalSource:`{
  args: {
    socials: []
  }
}`,...a.parameters?.docs?.source}}};t.parameters={...t.parameters,docs:{...t.parameters?.docs,source:{originalSource:`{
  play: async ({
    canvasElement
  }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", {
      name: /open navigation menu/i
    }));
  }
}`,...t.parameters?.docs?.source}}};const T=["Default","WithoutSocials","MenuOpen"];export{e as Default,t as MenuOpen,a as WithoutSocials,T as __namedExportsOrder,O as default};
