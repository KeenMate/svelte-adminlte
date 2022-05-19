// todo: move to dev code
// import "@fortawesome/fontawesome-free/css/all.css";
// import "icheck-bootstrap/icheck-bootstrap.css";
// import "admin-lte/build/scss/adminlte.scss";
// import "toastr/build/toastr.css";
// import "admin-lte/dist/js/adminlte";

export {getConfig, setConfig} from "./src/config"

/* [1] Alerts */
export {default as BaseAlert} from "./src/alerts/BaseAlert.svelte"
export {default as DangerAlert} from "./src/alerts/DangerAlert.svelte"
export {default as InfoAlert} from "./src/alerts/InfoAlert.svelte"
export {default as SuccessAlert} from "./src/alerts/SuccessAlert.svelte"
export {default as WarningAlert} from "./src/alerts/WarningAlert.svelte"

/* [2] Form */
//export { default as LteSwitch } from "./form/LteSwitch.svelte"; //!use Switch instead
export {default as UploadModal} from "./src/form/UploadModal.svelte"

/* [2.1] Form > Input */
export {default as Checkbox} from "./src/form/input/Checkbox.svelte"
export {default as CkEditor} from "./src/form/input/CkEditor.svelte"
export {default as DateRangePicker} from "./src/form/input/DateRangePicker.svelte"
// export { default as Dropdown } from "./form/input/Dropdown.svelte";
export {default as EmailInput} from "./src/form/input/EmailInput.svelte"
export {default as FileInput} from "./src/form/input/FileInput.svelte"
// export { default as Multiselect } from "./form/input/Multiselect.svelte";
export {default as NumberInput} from "./src/form/input/NumberInput.svelte"
export {default as Radio} from "./src/form/input/Radio.svelte"
export {default as Switch} from "./src/form/input/Switch.svelte"
export {default as Textarea} from "./src/form/input/Textarea.svelte"
export {default as TextInput} from "./src/form/input/TextInput.svelte"
export {default as PasswordInput} from "./src/form/input/PasswordInput.svelte"
export {default as PhoneInput} from "./src/form/input/PhoneInput.svelte"

/* [2.2] Form > Structure */
export {default as Form} from "./src/form/structure/Form.svelte"
export {default as FormGroup} from "./src/form/structure/FormGroup.svelte"
export {default as InputGroup} from "./src/form/structure/InputGroup.svelte"
export {default as InputGroupAppend} from "./src/form/structure/InputGroupAppend.svelte"
export {default as InputGroupPrepend} from "./src/form/structure/InputGroupPrepend.svelte"
export {default as Label} from "./src/form/structure/Label.svelte"

/* [4] Structure */
export {default as BreadcrumbItem} from "./src/structure/BreadcrumbItem.svelte"
export {default as Card} from "./src/structure/Card.svelte"
export {default as KeenFooter} from "./src/structure/KeenFooter.svelte"
export {default as Modal} from "./src/structure/Modal.svelte"
export {default as OneColumnNarrow} from "./src/structure/OneColumnNarrow.svelte"
export {default as PageHeader} from "./src/structure/PageHeader.svelte"
export {default as FlexContainer} from "./src/structure/FlexContainer.svelte"

/* [4.1] Structure > Navigation */
export {default as BrandNavLogo} from "./src/structure/navigation/BrandNavLogo.svelte"
export {default as BrandNavLogoSidebar} from "./src/structure/navigation/BrandNavLogoSidebar.svelte"
export {default as MobileNavToggle} from "./src/structure/navigation/MobileNavToggle.svelte"
export {default as Sidebar} from "./src/structure/navigation/Sidebar.svelte"
export {default as SidebarNavItem} from "./src/structure/navigation/SidebarNavItem.svelte"
export {default as TopNavigation} from "./src/structure/navigation/TopNavigation.svelte"
export {default as TopNavItem} from "./src/structure/navigation/TopNavItem.svelte"
export {default as UserDropdownMenu} from "./src/structure/navigation/UserDropdownMenu.svelte"

/* [4.1.1] Structure > Navigation > Dropdown */
export {default as Dropdown} from "./src/structure/navigation/dropdown/Dropdown.svelte"
export {default as DropdownButton} from "./src/structure/navigation/dropdown/DropdownButton.svelte"
export {default as DropdownDivider} from "./src/structure/navigation/dropdown/DropdownDivider.svelte"
export {default as DropdownItem} from "./src/structure/navigation/dropdown/DropdownItem.svelte"
export {default as DropdownMenu} from "./src/structure/navigation/dropdown/DropdownMenu.svelte"


/* [4.1.2] Structure > Navigation > Tabs */
export {default as TabItem} from "./src/structure/navigation/tabs/TabItem.svelte"
export {default as Tabs} from "./src/structure/navigation/tabs/Tabs.svelte"

/* [5] Tables */
export {default as ErrorRow} from "./src/tables/ErrorRow.svelte"
export {default as LoadingRow} from "./src/tables/LoadingRow.svelte"
export {default as TableCondensed} from "./src/tables/TableCondensed.svelte"
export {default as TableCondensedWithHeader} from "./src/tables/TableCondensedWithHeader.svelte"
export {default as TableEmptyRow} from "./src/tables/TableEmptyRow.svelte"
export {default as TableRowFullWidth} from "./src/tables/TableRowFullWidth.svelte"

/* [6] UI */
export {default as AutoScroll} from "./src/ui/AutoScroll.svelte"
export {default as Badge} from "./src/ui/Badge.svelte"
export {default as BsProgress} from "./src/ui/BsProgress.svelte"
export {default as ButtonDropdown} from "./src/ui/ButtonDropdown.svelte"
export {default as ButtonDropdownButton} from "./src/ui/ButtonDropdownButton.svelte"
export {default as ButtonDropdownItem} from "./src/ui/ButtonDropdownItem.svelte"
export {default as Callout} from "./src/ui/Callout.svelte"
export {default as InfoBox} from "./src/ui/InfoBox.svelte"
export {default as Loader} from "./src/ui/Loader.svelte"
export {default as LteButton} from "./src/ui/LteButton.svelte"
export {default as LteButtonRefresh} from "./src/ui/LteButtonRefresh.svelte"
export {default as LteLabel} from "./src/ui/LteLabel.svelte"
export {default as ModalCloseButton} from "./src/ui/ModalCloseButton.svelte"
export {default as Pagination} from "./src/ui/Pagination.svelte"
export {default as PasswordStrength} from "./src/ui/PasswordStrength.svelte"
export {default as DraggableContainer} from "./src/ui/DraggableContainer.svelte"

/* [6.1] UI > Context menu */
export {default as ContextMenu} from "./src/ui/context-menu/ContextMenu.svelte"
export {default as ContextMenuDivider} from "./src/ui/context-menu/ContextMenuDivider.svelte"
export {default as ContextMenuEntry} from "./src/ui/context-menu/ContextMenuEntry.svelte"
export {default as ContextMenuLabel} from "./src/ui/context-menu/ContextMenuLabel.svelte"

/* [7] Toasts */
export {default as Toastr} from "./src/toasts/toastr"
