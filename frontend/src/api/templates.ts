import { apiGet, apiPost, apiPut, apiDelete } from './client'
import type { FavoriteMedicine, FavoriteTest, AdviceTemplate, FollowupTemplate } from '../types/template'

export function fetchFavoriteMedicines(): Promise<FavoriteMedicine[]> {
  return apiGet<FavoriteMedicine[]>('/favorite-medicines')
}

export function createFavoriteMedicine(name: string): Promise<FavoriteMedicine> {
  return apiPost<FavoriteMedicine>('/favorite-medicines', { name })
}

export function updateFavoriteMedicine(id: number, name: string): Promise<FavoriteMedicine> {
  return apiPut<FavoriteMedicine>(`/favorite-medicines/${id}`, { name })
}

export function deleteFavoriteMedicine(id: number): Promise<void> {
  return apiDelete(`/favorite-medicines/${id}`)
}

export function fetchFavoriteTests(): Promise<FavoriteTest[]> {
  return apiGet<FavoriteTest[]>('/favorite-tests')
}

export function createFavoriteTest(name: string): Promise<FavoriteTest> {
  return apiPost<FavoriteTest>('/favorite-tests', { name })
}

export function updateFavoriteTest(id: number, name: string): Promise<FavoriteTest> {
  return apiPut<FavoriteTest>(`/favorite-tests/${id}`, { name })
}

export function deleteFavoriteTest(id: number): Promise<void> {
  return apiDelete(`/favorite-tests/${id}`)
}

export function fetchAdviceTemplates(): Promise<AdviceTemplate[]> {
  return apiGet<AdviceTemplate[]>('/advice-templates')
}

export function createAdviceTemplate(title: string, content: string): Promise<AdviceTemplate> {
  return apiPost<AdviceTemplate>('/advice-templates', { title, content })
}

export function updateAdviceTemplate(id: number, title: string, content: string): Promise<AdviceTemplate> {
  return apiPut<AdviceTemplate>(`/advice-templates/${id}`, { title, content })
}

export function deleteAdviceTemplate(id: number): Promise<void> {
  return apiDelete(`/advice-templates/${id}`)
}

export function fetchFollowupTemplates(): Promise<FollowupTemplate[]> {
  return apiGet<FollowupTemplate[]>('/followup-templates')
}

export function createFollowupTemplate(title: string, value: string): Promise<FollowupTemplate> {
  return apiPost<FollowupTemplate>('/followup-templates', { title, value })
}

export function updateFollowupTemplate(id: number, title: string, value: string): Promise<FollowupTemplate> {
  return apiPut<FollowupTemplate>(`/followup-templates/${id}`, { title, value })
}

export function deleteFollowupTemplate(id: number): Promise<void> {
  return apiDelete(`/followup-templates/${id}`)
}
