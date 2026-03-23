import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'

export function useMembers() {
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchMembers = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('members')
      .select('*')
      .order('name')
    if (error) setError(error.message)
    else setMembers(data || [])
    setLoading(false)
  }

  useEffect(() => {
    fetchMembers()
  }, [])

  const addMember = async (memberData) => {
    const { data, error } = await supabase
      .from('members')
      .insert([memberData])
      .select()
      .single()
    if (!error) setMembers((prev) => [...prev, data].sort((a, b) => a.name.localeCompare(b.name)))
    return { data, error }
  }

  return { members, loading, error, refetch: fetchMembers, addMember }
}
