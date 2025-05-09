"use client"

import { useState, useEffect } from "react"
import {
    ChevronDown,
    ChevronUp,
    Edit,
    Trash,
    Plus,
    Search,
    RefreshCw,
    Eye,
    ChevronLeft,
    ChevronRight,
    X,
    ImageIcon,
} from "lucide-react"
import axios from "axios"
import api from "../src/config/auth/api"

// Base URL for API
const API_BASE_URL = "http://localhost:8888" // Replace with your actual API base URL

const AdminPanel = () => {
    const [activeTab, setActiveTab] = useState("products")
    const [data, setData] = useState([])
    const [loading, setLoading] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [sortConfig, setSortConfig] = useState({ key: null, direction: null })
    const [selectedItems, setSelectedItems] = useState([])
    const [isAllSelected, setIsAllSelected] = useState(false)
    const [error, setError] = useState(null)
    const [categories, setCategories] = useState([])
    const [regions, setRegions] = useState([])
    const [districts, setDistricts] = useState({})

    // Modal states
    const [showModal, setShowModal] = useState(false)
    const [modalType, setModalType] = useState("")

    // Form states
    const [categoryForm, setCategoryForm] = useState({
        name: "",
        imageUrl: "",
        parentId: "",
    })

    const [propertyForm, setPropertyForm] = useState({
        name: "",
        type: "STRING",
        categoryId: "",
        options: "",
    })

    const [uploadedImage, setUploadedImage] = useState(null)
    const [uploadingImage, setUploadingImage] = useState(false)

    // Fetch data based on active tab
    const fetchData = async (type) => {
        setLoading(true)
        setError(null)
        try {
            let response

            switch (type) {
                case "products":
                    response = await api.get(`${API_BASE_URL}/property`)
                    break
                case "categories":
                    response = await api.get(`${API_BASE_URL}/category`)
                    break
                case "properties":
                    response = await api.get(`${API_BASE_URL}/property`)
                    break
                case "users":
                    response = await api.get(`${API_BASE_URL}/profiles`)
                    break
                case "locations":
                    response = await api.get(`${API_BASE_URL}/location/regions`)
                    break
                default:
                    response = { data: [] }
            }

            setData(response.data?.content || [])
        } catch (err) {
            console.error(`Error fetching ${type}:`, err)
            setError(`Failed to load ${type}. ${err.message}`)

            // For demo purposes, use mock data if API fails
            const mockData = getMockData(type)
            setData(mockData)
        } finally {
            setLoading(false)
        }
    }

    // Get mock data for demo purposes
    const getMockData = (type) => {
        const mockData = {
            products: [
                {
                    id: 1,
                    title: "iPhone 13 Pro Max",
                    description: "Eng so'nggi iPhone modeli...",
                    price: 1299.99,
                    minPrice: 1200,
                    maxPrice: 1400,
                    mainImage: "https://example.com/main.jpg",
                    images: ["https://example.com/image1.jpg"],
                    categoryId: 1,
                    location: "Toshkent",
                    createdAt: "2025-04-16T13:45:00.000Z",
                },
                {
                    id: 2,
                    title: "Samsung Galaxy S22",
                    description: "Samsung'ning eng yangi flagmani",
                    price: 1099.99,
                    minPrice: 1000,
                    maxPrice: 1200,
                    mainImage: "https://example.com/samsung.jpg",
                    images: ["https://example.com/samsung1.jpg"],
                    categoryId: 1,
                    location: "Samarqand",
                    createdAt: "2025-04-15T10:30:00.000Z",
                },
                {
                    id: 3,
                    title: "MacBook Pro M2",
                    description: "Apple'ning eng kuchli noutbuki",
                    price: 1999.99,
                    minPrice: 1900,
                    maxPrice: 2100,
                    mainImage: "https://example.com/macbook.jpg",
                    images: ["https://example.com/macbook1.jpg"],
                    categoryId: 2,
                    location: "Toshkent",
                    createdAt: "2025-04-14T09:15:00.000Z",
                },
            ],
            categories: [
                { id: 1, name: "Elektronika", slug: "elektronika", parentId: null, createdAt: "2023-05-15" },
                { id: 2, name: "Kompyuterlar", slug: "kompyuterlar", parentId: null, createdAt: "2023-05-16" },
                { id: 3, name: "Telefonlar", slug: "telefonlar", parentId: 1, createdAt: "2023-05-17" },
            ],
            properties: [
                {
                    id: 1,
                    name: "Rang",
                    type: "SELECT",
                    required: true,
                    options: ["Qora", "Oq", "Qizil"],
                    createdAt: "2023-05-15",
                },
                {
                    id: 2,
                    name: "O'lcham",
                    type: "SELECT",
                    required: true,
                    options: ["Kichik", "O'rta", "Katta"],
                    createdAt: "2023-05-16",
                },
                { id: 3, name: "Og'irligi", type: "NUMBER", required: false, createdAt: "2023-05-17" },
            ],
            users: [
                { id: 1, name: "Alisher Navoiy", email: "alisher@example.com", role: "admin", createdAt: "2023-05-15" },
                { id: 2, name: "Bobur Mirzo", email: "bobur@example.com", role: "editor", createdAt: "2023-05-16" },
                { id: 3, name: "Ulug'bek Muhammad", email: "ulugbek@example.com", role: "user", createdAt: "2023-05-17" },
            ],
            locations: [
                { id: 1, name: "Toshkent", type: "region", parentId: null, createdAt: "2023-05-15" },
                { id: 2, name: "Samarqand", type: "region", parentId: null, createdAt: "2023-05-16" },
                { id: 3, name: "Mirzo Ulug'bek", type: "district", parentId: 1, createdAt: "2023-05-17" },
            ],
        }

        return mockData[type] || []
    }

    // Fetch categories for product relation
    const fetchCategories = async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/category`)
            setCategories(response.data?.content || [])
        } catch (err) {
            console.error("Error fetching categories:", err)
            // Mock data for demo
            setCategories([
                { id: 1, name: "Elektronika" },
                { id: 2, name: "Kompyuterlar" },
                { id: 3, name: "Telefonlar" },
            ])
        }
    }

    // Fetch regions for location relation
    const fetchRegions = async () => {
        try {
            const response = await api.get(`${API_BASE_URL}/location/regions`)
            setRegions(response.data?.content || [])
        } catch (err) {
            console.error("Error fetching regions:", err)
            // Mock data for demo
            setRegions([
                { id: 1, name: "Toshkent" },
                { id: 2, name: "Samarqand" },
                { id: 3, name: "Buxoro" },
            ])
        }
    }

    // Fetch districts for a specific region
    const fetchDistricts = async (regionId) => {
        try {
            const response = await api.get(`${API_BASE_URL}/location/districts/${regionId}`)
            setDistricts((prev) => ({ ...prev, [regionId]: response.data || [] }))
        } catch (err) {
            console.error(`Error fetching districts for region ${regionId}:`, err)
            // Mock data for demo
            setDistricts((prev) => ({
                ...prev,
                [regionId]: [
                    { id: 1, name: "Mirzo Ulug'bek", regionId: 1 },
                    { id: 2, name: "Yunusobod", regionId: 1 },
                    { id: 3, name: "Chilonzor", regionId: 1 },
                ],
            }))
        }
    }

    // Load initial data when tab changes
    useEffect(() => {
        fetchData(activeTab)
        setSelectedItems([])
        setIsAllSelected(false)

        // Load related data
        fetchCategories()

        if (activeTab === "products") {
            fetchRegions()
        }
    }, [activeTab])

    // Handle sorting
    const requestSort = (key) => {
        let direction = "ascending"
        if (sortConfig.key === key && sortConfig.direction === "ascending") {
            direction = "descending"
        }
        setSortConfig({ key, direction })
    }

    // Get sorted data
    const getSortedData = () => {
        if (!sortConfig.key) return data

        return [...data].sort((a, b) => {
            if (a[sortConfig.key] < b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? -1 : 1
            }
            if (a[sortConfig.key] > b[sortConfig.key]) {
                return sortConfig.direction === "ascending" ? 1 : -1
            }
            return 0
        })
    }

    // Filter data based on search term
    const getFilteredData = () => {
        if (!searchTerm) return getSortedData()

        return getSortedData().filter((item) => {
            return Object.values(item).some((val) => {
                if (val === null || val === undefined) return false
                if (typeof val === "object") {
                    return JSON.stringify(val).toLowerCase().includes(searchTerm.toLowerCase())
                }
                return val.toString().toLowerCase().includes(searchTerm.toLowerCase())
            })
        })
    }

    // Get table headers based on data
    const getHeaders = () => {
        if (data.length === 0) return []

        // For products, show only important fields
        if (activeTab === "products") {
            return ["id", "title", "price", "categoryId", "location", "createdAt"]
        }

        return Object.keys(data[0])
    }

    // Get cell value with special handling for objects and arrays
    const getCellValue = (item, key) => {
        const value = item[key]

        if (value === null || value === undefined) return "-"

        if (key === "images" && Array.isArray(value)) {
            return `${value.length} images`
        }

        if (key === "mainImage" || (key === "images" && typeof value === "string")) {
            return (
                <div className="flex items-center">
                    <img
                        src={value || "/placeholder.svg"}
                        alt="Thumbnail"
                        className="h-8 w-8 rounded object-cover mr-2"
                        onError={(e) => {
                            e.target.src = "https://via.placeholder.com/40"
                        }}
                    />
                    <span className="truncate max-w-[150px]">{value}</span>
                </div>
            )
        }

        if (key === "categoryId" && activeTab === "products") {
            const category = categories.find((c) => c.id === value)
            return category ? category.name : value
        }

        if (key === "options" && Array.isArray(value)) {
            return value.join(", ")
        }

        if (typeof value === "object") {
            return JSON.stringify(value).substring(0, 50) + "..."
        }

        if (key === "createdAt") {
            return new Date(value).toLocaleDateString()
        }

        return value.toString()
    }

    // Handle select all
    const handleSelectAll = () => {
        if (isAllSelected) {
            setSelectedItems([])
        } else {
            setSelectedItems(getFilteredData().map((item) => item.id))
        }
        setIsAllSelected(!isAllSelected)
    }

    // Handle select individual item
    const handleSelectItem = (id) => {
        if (selectedItems.includes(id)) {
            setSelectedItems(selectedItems.filter((itemId) => itemId !== id))
        } else {
            setSelectedItems([...selectedItems, id])
        }
    }

    // Handle refresh
    const handleRefresh = () => {
        fetchData(activeTab)
    }

    // Handle add new item
    const handleAddNew = () => {
        if (activeTab === "categories") {
            setModalType("category")
            setCategoryForm({
                name: "",
                imageUrl: "",
                parentId: "",
            })
            setUploadedImage(null)
            setShowModal(true)
        } else if (activeTab === "properties") {
            setModalType("property")
            setPropertyForm({
                name: "",
                type: "STRING",
                categoryId: "",
                options: "",
            })
            setShowModal(true)
        } else {
            // For other tabs
            alert(`Add new ${activeTab.slice(0, -1)} functionality would go here`)
        }
    }

    // Handle edit item
    const handleEdit = (id) => {
        // Implement edit functionality
        alert(`Edit ${activeTab.slice(0, -1)} with ID ${id} functionality would go here`)
    }

    // Handle delete item
    const handleDelete = (id) => {
        // Implement delete functionality
        alert(`Delete ${activeTab.slice(0, -1)} with ID ${id} functionality would go here`)
    }

    // Handle view item details
    const handleView = (id) => {
        // Implement view details functionality
        alert(`View ${activeTab.slice(0, -1)} with ID ${id} functionality would go here`)
    }

    // Get tab class
    const getTabClass = (tab) => {
        return activeTab === tab
            ? "px-4 py-3 text-blue-600 font-medium border-b-2 border-blue-600"
            : "px-4 py-3 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
    }

    // Handle category form change
    const handleCategoryFormChange = (e) => {
        const { name, value } = e.target
        setCategoryForm({
            ...categoryForm,
            [name]: value,
        })
    }

    // Handle property form change
    const handlePropertyFormChange = (e) => {
        const { name, value } = e.target
        setPropertyForm({
            ...propertyForm,
            [name]: value,
        })
    }

    // Handle file upload
    const handleFileUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const formData = new FormData()
        formData.append("file", file)

        setUploadingImage(true)

        try {
            // Upload file to server
            const response = await api.post(`${API_BASE_URL}/file/upload`, formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            })
            console.log(response.data);
            
            // Set the image URL from response
            setUploadedImage(URL.createObjectURL(file))
            setCategoryForm({
                ...categoryForm,
                imageUrl: response.data?.content?.url, // Assuming the API returns the URL in this format
            })
        } catch (error) {
            console.error("Error uploading file:", error)
            alert("Failed to upload image. Please try again.")

            // For demo, set a placeholder URL
            setUploadedImage(URL.createObjectURL(file))
            setCategoryForm({
                ...categoryForm,
                imageUrl: "https://example.com/uploaded-image.jpg",
            })
        } finally {
            setUploadingImage(false)
        }
    }

    // Submit category form
    const submitCategoryForm = async (e) => {
        e.preventDefault()

        try {
            const response = await api.post(`${API_BASE_URL}/category`, categoryForm)

            // Refresh data after successful creation
            fetchData("categories")
            fetchCategories()

            // Close modal
            setShowModal(false)

            // Show success message
            alert("Category created successfully!")
        } catch (error) {
            console.error("Error creating category:", error)
            alert("Failed to create category. Please try again.")
        }
    }

    // Submit property form
    const submitPropertyForm = async (e) => {
        e.preventDefault()

        // Process options if type is SELECT
        const formData = { ...propertyForm }

        if (formData.type === "SELECT") {
            // Convert comma-separated string to array
            formData.options = formData.options.split(",").map((item) => item.trim())
        }

        try {
            const response = await api.post(`${API_BASE_URL}/property`, formData)

            // Refresh data after successful creation
            fetchData("properties")

            // Close modal
            setShowModal(false)

            // Show success message
            alert("Property created successfully!")
        } catch (error) {
            console.error("Error creating property:", error)
            alert("Failed to create property. Please try again.")
        }
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Header */}
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-2xl font-bold text-gray-900">Admin Panel</h1>
                    <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                            A
                        </div>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                {/* Tabs */}
                <div className="bg-white rounded-lg shadow-sm mb-6 overflow-hidden">
                    <div className="flex overflow-x-auto">
                        {["products", "categories", "properties", "users", "locations"].map((tab) => (
                            <button key={tab} onClick={() => setActiveTab(tab)} className={getTabClass(tab)}>
                                <span className="capitalize">{tab}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {/* Table Controls */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                        <div className="relative w-full sm:w-80">
                            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                                <Search className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 p-2.5"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                <RefreshCw className="h-4 w-4" />
                                <span>Refresh</span>
                            </button>

                            <button
                                onClick={handleAddNew}
                                className="flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add New</span>
                            </button>
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 p-4 text-sm text-red-700 bg-red-100 rounded-lg flex items-center">
                            <svg
                                className="w-5 h-5 mr-2 text-red-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                    clipRule="evenodd"
                                ></path>
                            </svg>
                            {error}
                        </div>
                    )}

                    {/* Table */}
                    <div className="overflow-x-auto rounded-lg border border-gray-200">
                        {loading ? (
                            <div className="flex justify-center items-center h-64">
                                <div className="flex flex-col items-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                                    <p className="mt-4 text-gray-600">Loading data...</p>
                                </div>
                            </div>
                        ) : data.length === 0 ? (
                            <div className="flex flex-col justify-center items-center h-64">
                                <svg
                                    className="w-16 h-16 text-gray-300"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                    xmlns="http://www.w3.org/2000/svg"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                                    ></path>
                                </svg>
                                <p className="mt-4 text-gray-500 text-lg">No data available</p>
                                <p className="text-gray-400 text-sm">Try changing your search or adding new items</p>
                            </div>
                        ) : (
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={isAllSelected}
                                                    onChange={handleSelectAll}
                                                />
                                            </div>
                                        </th>
                                        {getHeaders().map((header) => (
                                            <th
                                                key={header}
                                                scope="col"
                                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                                                onClick={() => requestSort(header)}
                                            >
                                                <div className="flex items-center gap-1">
                                                    <span>{header === "categoryId" ? "Category" : header}</span>
                                                    {sortConfig.key === header ? (
                                                        sortConfig.direction === "ascending" ? (
                                                            <ChevronUp className="h-4 w-4" />
                                                        ) : (
                                                            <ChevronDown className="h-4 w-4" />
                                                        )
                                                    ) : (
                                                        <ChevronDown className="h-4 w-4 opacity-0 group-hover:opacity-50" />
                                                    )}
                                                </div>
                                            </th>
                                        ))}
                                        <th
                                            scope="col"
                                            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                                        >
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {getFilteredData().map((item, index) => (
                                        <tr
                                            key={item.id}
                                            className={index % 2 === 0 ? "bg-white hover:bg-blue-50" : "bg-gray-50 hover:bg-blue-50"}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <input
                                                    type="checkbox"
                                                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                                                    checked={selectedItems.includes(item.id)}
                                                    onChange={() => handleSelectItem(item.id)}
                                                />
                                            </td>
                                            {getHeaders().map((key) => (
                                                <td key={key} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {getCellValue(item, key)}
                                                </td>
                                            ))}
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <div className="flex justify-end gap-2">
                                                    <button
                                                        className="p-1 rounded-full text-blue-600 hover:bg-blue-100"
                                                        onClick={() => handleView(item.id)}
                                                        title="View details"
                                                    >
                                                        <Eye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        className="p-1 rounded-full text-green-600 hover:bg-green-100"
                                                        onClick={() => handleEdit(item.id)}
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        className="p-1 rounded-full text-red-600 hover:bg-red-100"
                                                        onClick={() => handleDelete(item.id)}
                                                        title="Delete"
                                                    >
                                                        <Trash className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>

                    {/* Pagination */}
                    {data.length > 0 && (
                        <div className="flex items-center justify-between bg-white px-4 py-3 sm:px-6 mt-4 border border-gray-200 rounded-lg">
                            <div className="flex flex-1 justify-between sm:hidden">
                                <button className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Previous
                                </button>
                                <button className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
                                    Next
                                </button>
                            </div>
                            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                                <div>
                                    <p className="text-sm text-gray-700">
                                        Showing <span className="font-medium">1</span> to{" "}
                                        <span className="font-medium">{getFilteredData().length}</span> of{" "}
                                        <span className="font-medium">{getFilteredData().length}</span> results
                                    </p>
                                </div>
                                <div>
                                    <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                                        <button className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                            <span className="sr-only">Previous</span>
                                            <ChevronLeft className="h-5 w-5" />
                                        </button>
                                        <button
                                            aria-current="page"
                                            className="relative z-10 inline-flex items-center bg-blue-600 px-4 py-2 text-sm font-semibold text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                                        >
                                            1
                                        </button>
                                        <button className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0">
                                            <span className="sr-only">Next</span>
                                            <ChevronRight className="h-5 w-5" />
                                        </button>
                                    </nav>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
                        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                            <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
                        </div>

                        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
                            &#8203;
                        </span>

                        <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                                <div className="flex justify-between items-center pb-4 mb-4 border-b border-gray-200">
                                    <h3 className="text-lg font-medium text-gray-900">
                                        {modalType === "category" ? "Add New Category" : "Add New Property"}
                                    </h3>
                                    <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-500">
                                        <X className="h-6 w-6" />
                                    </button>
                                </div>

                                {modalType === "category" ? (
                                    <form onSubmit={submitCategoryForm}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                                Category Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={categoryForm.name}
                                                onChange={handleCategoryFormChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                placeholder="Enter category name"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parentId">
                                                Parent Category
                                            </label>
                                            <select
                                                id="parentId"
                                                name="parentId"
                                                value={categoryForm.parentId}
                                                onChange={handleCategoryFormChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                            >
                                                <option value="">None (Top Level Category)</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2">Category Image</label>

                                            <div className="mt-1 flex items-center">
                                                {uploadedImage ? (
                                                    <div className="relative">
                                                        <img
                                                            src={uploadedImage || "/placeholder.svg"}
                                                            alt="Category"
                                                            className="h-32 w-32 object-cover rounded-lg"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setUploadedImage(null)
                                                                setCategoryForm({ ...categoryForm, imageUrl: "" })
                                                            }}
                                                            className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                                                        >
                                                            <X className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
                                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                            <ImageIcon className="w-10 h-10 mb-3 text-gray-400" />
                                                            <p className="mb-2 text-sm text-gray-500">
                                                                <span className="font-semibold">Click to upload</span> or drag and drop
                                                            </p>
                                                            <p className="text-xs text-gray-500">SVG, PNG, JPG or GIF</p>
                                                        </div>
                                                        <input
                                                            id="imageUpload"
                                                            type="file"
                                                            className="hidden"
                                                            accept="image/*"
                                                            onChange={handleFileUpload}
                                                            disabled={uploadingImage}
                                                        />
                                                    </div>
                                                )}

                                                {!uploadedImage && (
                                                    <label
                                                        htmlFor="imageUpload"
                                                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                    >
                                                        {uploadingImage ? "Uploading..." : "Upload"}
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                ) : (
                                    <form onSubmit={submitPropertyForm}>
                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                                                Property Name
                                            </label>
                                            <input
                                                type="text"
                                                id="name"
                                                name="name"
                                                value={propertyForm.name}
                                                onChange={handlePropertyFormChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                placeholder="Enter property name"
                                                required
                                            />
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="type">
                                                Property Type
                                            </label>
                                            <select
                                                id="type"
                                                name="type"
                                                value={propertyForm.type}
                                                onChange={handlePropertyFormChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                required
                                            >
                                                <option value="STRING">String</option>
                                                <option value="NUMBER">Number</option>
                                                <option value="BOOLEAN">Boolean</option>
                                                <option value="SELECT">Select (Multiple Options)</option>
                                            </select>
                                        </div>

                                        <div className="mb-4">
                                            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="categoryId">
                                                Category
                                            </label>
                                            <select
                                                id="categoryId"
                                                name="categoryId"
                                                value={propertyForm.categoryId}
                                                onChange={handlePropertyFormChange}
                                                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                required
                                            >
                                                <option value="">Select a category</option>
                                                {categories.map((category) => (
                                                    <option key={category.id} value={category.id}>
                                                        {category.name}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        {propertyForm.type === "SELECT" && (
                                            <div className="mb-4">
                                                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="options">
                                                    Options (comma separated)
                                                </label>
                                                <textarea
                                                    id="options"
                                                    name="options"
                                                    value={propertyForm.options}
                                                    onChange={handlePropertyFormChange}
                                                    className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                                                    placeholder="Red, Green, Blue"
                                                    rows="3"
                                                    required
                                                />
                                                <p className="text-xs text-gray-500 mt-1">Enter options separated by commas</p>
                                            </div>
                                        )}

                                        <div className="flex justify-end pt-4">
                                            <button
                                                type="button"
                                                onClick={() => setShowModal(false)}
                                                className="mr-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                type="submit"
                                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            >
                                                Save
                                            </button>
                                        </div>
                                    </form>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminPanel
