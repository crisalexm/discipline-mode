import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { getWeekNumber } from '../lib/utils'

export function useWeighIns(memberId = null) {
  const [weighIns, setWeighIns] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchWeighIns = async () => {
    setLoading(true)
    let query = supabase
      .from('weigh_ins')
      .select('*, members(name, height_cm, initial_weight_kg, goal_weight_kg)')
      .order('weigh_in_date', { ascending: true })

    if (memberId) query = query.eq('member_id', memberId)

    const { data, error } = await query
    if (error) setError(error.message)
    else setWeighIns(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchWeighIns()
  }, [memberId])

  const addWeighIn = async (weighInData) => {
    const week_number = getWeekNumber(weighInData.weigh_in_date)
    const { data, error } = await supabase
      .from('weigh_ins')
      .insert([{ ...weighInData, week_number }])
      .select('*, members(name, height_cm, initial_weight_kg, goal_weight_kg)')
      .single()
    if (!error) {
      setWeighIns((prev) => [...prev, data].sort((a, b) => new Date(a.weigh_in_date) - new Date(b.weigh_in_date)))
    }
    return { data, error }
  }

  return { weighIns, loading, error, refetch: fetchWeighIns, addWeighIn }
}
