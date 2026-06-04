import React, { useCallback, useEffect, useState } from 'react'
import { GraduationCap, Phone, Trash2, Search, Edit2, RefreshCw, Plus, Image as ImageIcon } from 'lucide-react'
import api, { assetUrl, getStudentsList } from '../lib/api'
import Modal from '../components/Modal'
import usePagination from '../hooks/usePagination'

const limit = 10

export default function Students() {
  const [students, setStudents] = useState([])
  const { page, totalPages, total, setPage, setPaginationData, getParams, resetPage } = usePagination(limit)
  const [loading, setLoading] = useState(false)
  const [activeFilters, setActiveFilters] = useState({
    student_name: '',
    school_name: '',
    standard: '',
    status: '1'
  })
  const [formLoading, setFormLoading] = useState(false)
  const [localFilters, setLocalFilters] = useState({
    student_name: '',
    school_name: '',
    standard: '',
    status: '1'
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedStudent, setSelectedStudent] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const currentPage = Math.min(Math.max(page || 1, 1), totalPages)
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1)

  const fetchStudents = useCallback(async () => {
    setLoading(true)
    try {
      const res = await getStudentsList(getParams(activeFilters))
      const rows = res.data?.data || res.data || []
      const pg = res.data?.pagination || {}
      setStudents(Array.isArray(rows) ? rows : [])
      setPaginationData(pg)
    } catch (err) {
      setStudents([])
      setPaginationData({ page: 1, totalPages: 1, total: 0 })
      setError(err.response?.data?.message || 'Failed to load students')
    } finally {
      setLoading(false)
    }
  }, [activeFilters, page])

  useEffect(() => {
    fetchStudents()
  }, [fetchStudents])

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this student?')) return
    try {
      await api.delete(`/content/students/${id}`)
      await fetchStudents()
      setSuccess('Student deleted successfully')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError('Failed to delete student')
    }
  }

  const handleEdit = (student) => {
    setSelectedStudent(student)
    setIsModalOpen(true)
  }

  const handleCreate = () => {
    setSelectedStudent(null)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedStudent(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setFormLoading(true)
    setError('')
    const formData = new FormData(e.target)
    try {
      if (selectedStudent) {
        await api.put(`/content/students/${selectedStudent.id}`, formData)
      } else {
        await api.post('/content/students', formData)
      }
      await fetchStudents()
      setSuccess(`Student ${selectedStudent ? 'updated' : 'created'} successfully`)
      setIsModalOpen(false)
      setSelectedStudent(null)
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update student')
    } finally {
      setFormLoading(false)
    }
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setLocalFilters(prev => ({ ...prev, [name]: value }))
  }

  const applyFilters = () => {
    setActiveFilters({ ...localFilters })
    resetPage()
  }

  const resetFilters = () => {
    setLocalFilters({ student_name: '', school_name: '', standard: '', status: '' })
    setActiveFilters({ student_name: '', school_name: '', standard: '', status: '' })
    resetPage()
  }

  const groupedStudents = React.useMemo(() => {
    return students.reduce((acc, student) => {
      const year = student.createdAt ? new Date(student.createdAt).getFullYear() : (student.cdate ? new Date(student.cdate).getFullYear() : 'Unknown');
      if (!acc[year]) acc[year] = [];
      acc[year].push(student);
      return acc;
    }, {});
  }, [students]);

  const sortedYears = Object.keys(groupedStudents).sort((a, b) => b === 'Unknown' ? 1 : a === 'Unknown' ? -1 : b - a);

  return (
    <div className="space-y-6 animate-slide-up select-none text-text">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-text">Students</h2>

        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <button
            onClick={fetchStudents}
            className="flex items-center justify-center p-2.5 rounded-xl bg-surface-secondary hover:bg-surface border border-border text-text-secondary hover:text-text transition-all"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
          <button
            onClick={handleCreate}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all shadow-glow-primary"
          >
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Student Name</label>
            <input
              type="text"
              name="student_name"
              value={localFilters.student_name}
              onChange={handleFilterChange}
              placeholder="Search by student name"
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">School Name</label>
            <input
              type="text"
              name="school_name"
              value={localFilters.school_name}
              onChange={handleFilterChange}
              placeholder="Search by school name"
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Standard</label>
            <input
              type="text"
              name="standard"
              value={localFilters.standard}
              onChange={handleFilterChange}
              placeholder="Search by standard"
              className="w-full bg-input-bg text-text placeholder-text-secondary/50 border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Status</label>
            <select
              name="status"
              value={localFilters.status}
              onChange={handleFilterChange}
              className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
            >
              <option value="">All</option>
              <option value="1">Active</option>
              <option value="0">Pending</option>
            </select>
          </div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={applyFilters}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-semibold transition-all shadow-glow-primary"
          >
            Apply Filters
          </button>
          <button
            onClick={resetFilters}
            className="flex items-center gap-2 bg-surface-secondary hover:bg-surface text-text px-4 py-2 rounded-xl text-sm font-semibold transition-all border border-border"
          >
            Reset
          </button>
        </div>
      </div>

      {/* Alerts */}
      {error && (
        <div className="bg-error-bg border border-error-border text-error-text p-4 rounded-2xl text-sm flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-error animate-ping"></span>
          {error}
        </div>
      )}
      {success && (
        <div className="bg-success-bg border border-success-border text-success-text p-4 rounded-2xl text-sm flex items-center gap-2 animate-fade-in shadow-sm">
          <span className="w-2 h-2 rounded-full bg-success animate-ping"></span>
          {success}
        </div>
      )}

      {/* Main Grid */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <div className="w-8 h-8 rounded-full border-2 border-primary/25 border-t-primary animate-spin"></div>
          <span className="text-text-secondary text-sm">Loading students...</span>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-16 text-center shadow-glass-sm flex flex-col items-center justify-center gap-4">
          <GraduationCap className="w-12 h-12 text-text-secondary/40 animate-pulse-slow" />
          <div>
            <h4 className="font-bold text-text">No students found</h4>
            <p className="text-text-secondary text-sm mt-1">There are no student records matching your criteria</p>
          </div>
        </div>
      ) : (
        <div className="space-y-10">
          {sortedYears.map(year => (
            <div key={year}>
              <h3 className="text-xl font-bold text-text mb-4 border-b border-border pb-2 inline-block">
                {year === 'Unknown' ? 'Unknown Year' : `Year ${year}`}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {groupedStudents[year].map(student => (
                  <div key={student.id} className="relative overflow-hidden bg-card border border-border hover:border-text-secondary/20 rounded-2xl p-6 shadow-glass-sm hover:shadow-glass-md transition-all duration-300 flex flex-col justify-between group">
                    <div>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-4">
                          {student.student_image ? (
                            <img src={assetUrl(student.student_image)} alt={student.student_name} className="w-16 h-16 rounded-full object-cover border border-border" />
                          ) : (
                            <div className="w-16 h-16 rounded-full bg-surface-secondary border border-border flex items-center justify-center text-text-secondary">
                              <GraduationCap className="w-8 h-8" />
                            </div>
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded bg-primary/10 border border-primary/20 text-primary font-bold text-sm uppercase tracking-wide">
                                Standard {student.standard}
                              </span>
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-sm font-bold ${Number(student.status) === 1 ? 'bg-success-bg text-success-text border border-success-border' : 'bg-warning/10 text-warning border border-warning/20'}`}>
                                {Number(student.status) === 1 ? 'Active' : 'Pending'}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-text mt-2.5 tracking-tight group-hover:text-primary transition-colors">
                              {student.surname} {student.student_name}
                            </h3>
                            <p className="text-sm text-text-secondary mt-1">Father: {student.father_name}</p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(student)}
                            className="p-2.5 text-primary hover:text-primary-hover bg-primary/10 hover:bg-primary/20 border border-primary/20 rounded-xl transition-all"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id)}
                            className="p-2.5 text-error-text hover:text-error bg-error-bg hover:bg-error/20 border border-error-border rounded-xl transition-all"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-4 space-y-2 text-sm text-text-secondary">
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary/70">School:</span>
                          <span className="text-text">{student.school_name}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-text-secondary/70">Percentage:</span>
                          <span className="text-text">{student.percentage}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Phone className="w-3.5 h-3.5 text-primary" />
                          <span className="font-semibold text-text font-mono">{student.mobile_number}</span>
                          {student.mobile_number_2 && (
                            <span className="text-text-secondary/70">/ {student.mobile_number_2}</span>
                          )}
                        </div>
                        {student.result_image && (
                          <div className="mt-3">
                            <img
                              src={assetUrl(student.result_image)}
                              alt="Result"
                              className="w-full h-32 object-cover rounded-xl border border-border"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-primary to-success opacity-25 group-hover:opacity-100 transition-opacity duration-300"></div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border border-border bg-surface-secondary/40 rounded-xl text-sm">
          <span className="text-text-secondary">
            Page {page} of {totalPages} {total ? `(${total} total)` : ''}
          </span>
          <div className="flex items-center gap-2">
            <button type="button" disabled={loading || page <= 1} onClick={() => setPage((current) => Math.max(1, current - 1))} className="px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed">
              Previous
            </button>
            {pageNumbers.map((item) => (
              <button
                key={item}
                type="button"
                disabled={loading || item === currentPage}
                onClick={() => setPage(item)}
                className={`min-w-10 px-3 py-2 rounded-lg border transition-all ${
                  item === currentPage
                    ? 'border-primary bg-primary/10 text-primary font-semibold disabled:opacity-100 disabled:cursor-default'
                    : 'border-border bg-card text-text hover:bg-surface-secondary disabled:opacity-50 disabled:cursor-not-allowed'
                }`}
              >
                {item}
              </button>
            ))}
            <button type="button" disabled={loading || page >= totalPages} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="px-3 py-2 rounded-lg border border-border bg-card text-text disabled:opacity-50 disabled:cursor-not-allowed">
              Next
            </button>
          </div>
        </div>
      )}

      <Modal
        isOpen={isModalOpen}
        title={selectedStudent ? 'Edit Student' : 'Add Student'}
        onClose={handleCloseModal}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-text">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Surname *</label>
              <input
                type="text"
                name="surname"
                defaultValue={selectedStudent?.surname || ''}
                required
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Student Name *</label>
              <input
                type="text"
                name="student_name"
                defaultValue={selectedStudent?.student_name || ''}
                required
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Father Name *</label>
            <input
              type="text"
              name="father_name"
              defaultValue={selectedStudent?.father_name || ''}
              required
              className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
            />
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">School Name *</label>
            <input
              type="text"
              name="school_name"
              defaultValue={selectedStudent?.school_name || ''}
              required
              className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Standard *</label>
              <input
                type="text"
                name="standard"
                defaultValue={selectedStudent?.standard || ''}
                required
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Percentage *</label>
              <input
                type="text"
                name="percentage"
                defaultValue={selectedStudent?.percentage || ''}
                required
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Mobile Number *</label>
              <input
                type="text"
                name="mobile_number"
                defaultValue={selectedStudent?.mobile_number || ''}
                required
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Mobile Number 2</label>
              <input
                type="text"
                name="mobile_number_2"
                defaultValue={selectedStudent?.mobile_number_2 || ''}
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Result Image</label>
              <input
                type="file"
                name="result_image"
                accept="image/*"
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
              {selectedStudent?.result_image && (
                <p className="text-sm text-text-secondary mt-2">Current result image exists</p>
              )}
            </div>
            <div>
              <label className="text-sm text-text-secondary mb-1.5 block">Student Image</label>
              <input
                type="file"
                name="student_image"
                accept="image/*"
                className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
              />
              {selectedStudent?.student_image && (
                <p className="text-sm text-text-secondary mt-2">Current student image exists</p>
              )}
            </div>
          </div>
          <div>
            <label className="text-sm text-text-secondary mb-1.5 block">Status</label>
            <select
              name="status"
              defaultValue={selectedStudent?.status ?? 0}
              className="w-full bg-input-bg text-text border border-border hover:border-text-secondary/30 focus:border-primary/50 rounded-xl py-2.5 px-4 text-sm outline-none"
            >
              <option value={1}>Active</option>
              <option value={0}>Pending</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleCloseModal}
              className="flex-1 bg-surface-secondary hover:bg-surface text-text px-4 py-2.5 rounded-xl text-sm font-semibold transition-all border border-border"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={formLoading}
              className="flex-1 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-all disabled:opacity-50 shadow-glow-primary"
            >
              {formLoading ? 'Saving...' : selectedStudent ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  )
}
