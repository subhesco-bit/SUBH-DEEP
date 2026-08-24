import { Fingerprint } from 'lucide-react'
import {
  digitalIdentityAPI, roleManagementAPI, permissionManagementAPI,
  ssoAPI, mfaManagementAPI, consentManagementAPI, sessionManagementAPI,
} from '../services/api'
import ManagementPageShell from './_shared/ManagementPageShell'
import CrudSection from './_shared/CrudSection'

/** Identity domain modules M014-M020. None have a matching backend route
 *  mounted yet — see services/api.js comments for each. Per-user 2FA
 *  setup/verify/disable already exists on authAPI; this MFA-devices tab is
 *  the (still unbacked) device registry, a different concern. */
const TABS = [
  {
    id: 'digital-identity', label: 'Digital Identity (M018)', entityLabel: 'Identity',
    listFn: digitalIdentityAPI.getIdentities, createFn: digitalIdentityAPI.createIdentity, deleteFn: digitalIdentityAPI.deleteIdentity,
    hint: 'No backend route mounts /digital-identities yet.',
    fields: [{ name: 'user_id', label: 'User ID', required: true }, { name: 'identity_type', label: 'Identity type', type: 'select', options: ['Aadhaar', 'PAN', 'Voter ID', 'Passport', 'Other'] }, { name: 'reference_number', label: 'Reference number' }],
    columns: [{ key: 'user_id', label: 'User' }, { key: 'identity_type', label: 'Type' }, { key: 'reference_number', label: 'Reference' }],
  },
  {
    id: 'roles', label: 'Roles (M014)', entityLabel: 'Role',
    listFn: roleManagementAPI.getRoles, createFn: roleManagementAPI.createRole, deleteFn: roleManagementAPI.deleteRole,
    hint: 'No backend route mounts /roles yet.',
    fields: [{ name: 'name', label: 'Role name', required: true }, { name: 'description', label: 'Description', type: 'textarea' }],
    columns: [{ key: 'name', label: 'Name' }, { key: 'description', label: 'Description' }],
  },
  {
    id: 'permissions', label: 'Permissions (M015)', entityLabel: 'Permission',
    listFn: permissionManagementAPI.getPermissions, createFn: permissionManagementAPI.createPermission, deleteFn: permissionManagementAPI.deletePermission,
    hint: 'No backend route mounts /permissions yet.',
    fields: [{ name: 'name', label: 'Permission name', required: true }, { name: 'resource', label: 'Resource' } ],
    columns: [{ key: 'name', label: 'Name' }, { key: 'resource', label: 'Resource' }],
  },
  {
    id: 'sso', label: 'Single Sign-On (M016)', entityLabel: 'SSO provider',
    listFn: ssoAPI.getProviders, createFn: ssoAPI.createProvider, deleteFn: ssoAPI.deleteProvider,
    hint: 'No backend route mounts /sso-providers yet.',
    fields: [{ name: 'provider_name', label: 'Provider name', required: true }, { name: 'protocol', label: 'Protocol', type: 'select', options: ['SAML', 'OAuth2', 'OIDC'] }],
    columns: [{ key: 'provider_name', label: 'Provider' }, { key: 'protocol', label: 'Protocol' }],
  },
  {
    id: 'mfa', label: 'MFA Devices (M017)', entityLabel: 'Device',
    listFn: mfaManagementAPI.getDevices, createFn: mfaManagementAPI.createDevice, deleteFn: mfaManagementAPI.deleteDevice,
    hint: 'No backend route mounts /mfa-devices yet (per-user 2FA setup/verify/disable already exists on authAPI, a different concern).',
    fields: [{ name: 'user_id', label: 'User ID', required: true }, { name: 'device_type', label: 'Device type', type: 'select', options: ['Authenticator app', 'SMS', 'Hardware key'] }],
    columns: [{ key: 'user_id', label: 'User' }, { key: 'device_type', label: 'Device type' }],
  },
  {
    id: 'consent', label: 'Consent (M019)', entityLabel: 'Consent record',
    listFn: consentManagementAPI.getRecords, createFn: consentManagementAPI.createRecord, deleteFn: consentManagementAPI.deleteRecord,
    hint: 'No backend route mounts /consent-records yet.',
    fields: [{ name: 'user_id', label: 'User ID', required: true }, { name: 'purpose', label: 'Purpose' }, { name: 'granted', label: 'Granted', type: 'select', options: ['true', 'false'] }],
    columns: [{ key: 'user_id', label: 'User' }, { key: 'purpose', label: 'Purpose' }, { key: 'granted', label: 'Granted' }],
  },
  {
    id: 'sessions', label: 'Sessions (M020)', entityLabel: 'Session',
    listFn: sessionManagementAPI.getSessions, createFn: sessionManagementAPI.createSession, deleteFn: sessionManagementAPI.deleteSession,
    hint: 'No backend route mounts /sessions yet.',
    fields: [{ name: 'user_id', label: 'User ID', required: true }, { name: 'device', label: 'Device' }],
    columns: [{ key: 'user_id', label: 'User' }, { key: 'device', label: 'Device' }],
  },
]

function IdentityManagementPage() {
  return (
    <ManagementPageShell
      icon={Fingerprint}
      title="Identity Management"
      description="Digital identity, roles, permissions, SSO, MFA, consent and sessions (M014-M020)"
      accent="indigo"
      tabs={TABS.map((t) => ({ id: t.id, label: t.label }))}
    >
      {(tab) => {
        const active = TABS.find((t) => t.id === tab) || TABS[0]
        return (
          <CrudSection
            queryKey={`identity-${active.id}`}
            listFn={active.listFn}
            createFn={active.createFn}
            deleteFn={active.deleteFn}
            entityLabel={active.entityLabel}
            accent="indigo"
            notFoundHint={active.hint}
            fields={active.fields}
            columns={active.columns}
          />
        )
      }}
    </ManagementPageShell>
  )
}

export default IdentityManagementPage
