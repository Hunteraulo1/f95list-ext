import { mount } from 'svelte';
import Popup from './pages/Popup.svelte';
import Webapp from './pages/Webapp.svelte';

mount(window.location.hash === '#webapp' ? Webapp : Popup, { target: document.body });
