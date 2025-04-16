import { mount } from 'svelte';
import Popup from './Popup.svelte';
import Webapp from './Webapp.svelte';
import './app.css';

mount(window.location.hash === '#webapp' ? Webapp : Popup, { target: document.body });
