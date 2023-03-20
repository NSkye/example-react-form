# Example React Form

Simple but cleanly coded React form that tris to utilize SOLID principles to the full extent. Written by me for demonstration and as a template/reference material.

<img width="300" alt="image" src="https://user-images.githubusercontent.com/30626748/226431313-ed1d6cf2-32e1-496f-b1b7-5868a6531a51.png">


### Installation

```
git clone git@github.com:NSkye/example-react-form.git
cd example-react-form
npm i
npm run start
```

### Main highlights

1. Highly scalable and customizable: fully-implemented "observable-form" framework (src/libs/observable-form) enables exceptional flexibility
2. Great perfomance: if it doesn't have to be re-rendered, it won't be re-rendered. Components will subscribe to the specific updates that are important for them
3. Usage of async subscribtions greately contribute to perfomance too
4. Accessibility: semantic elements are used where they needed along with correct aria-attributes
