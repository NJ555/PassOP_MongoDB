import axios from 'axios'

// All vault API calls go through this module.
// Axios baseURL and withCredentials are set globally in AuthContext.jsx

export const getVaultEntries = () => axios.get('/vault')

export const createVaultEntry = (data) => axios.post('/vault', data)

export const updateVaultEntry = (id, data) => axios.put(`/vault/${id}`, data)

export const deleteVaultEntry = (id) => axios.delete(`/vault/${id}`)

export const toggleFavorite = (id) => axios.patch(`/vault/${id}/favorite`)
