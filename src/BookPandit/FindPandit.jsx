// Frontend/src/BookPandit/FindPandit.jsx

import React, { useState, useEffect } from "react";
import { panditApi } from "../api/panditApi";
import LoadingSpinner from '../components/common/LoadingSpinner';
import { analytics } from '../utils/analytics';
import "../styles/FindPandit.css";

export default function FindPandit() {
    const [search, setSearch] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [serviceFilter, setServiceFilter] = useState("");
    const [page, setPage] = useState(1);
    const [pandits, setPandits] = useState([]);
    const [locations, setLocations] = useState([]);
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [debugInfo, setDebugInfo] = useState("");
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        loadFilterOptions();
        loadPandits();
    }, []);

    useEffect(() => {
        loadPandits();
    }, [search, locationFilter, serviceFilter, page]);

    const loadFilterOptions = async () => {
        try {
            console.log('Loading filter options...');
            const data = await panditApi.getFilterOptions();
            console.log('Filter options loaded:', data);
            setLocations(data.locations || []);
            setServices(data.services || []);
        } catch (err) {
            console.error('Error loading filter options:', err);
            setError('Failed to load filter options');
        }
    };

    const loadPandits = async () => {
        analytics.trackSearch(search, {
            location: locationFilter,
            service: serviceFilter,
            page: page
        });
        setLoading(true);
        setError("");
        setDebugInfo("");
        try {
            console.log('Loading pandits with filters:', {
                search,
                locationFilter,
                serviceFilter,
                page
            });

            const filters = {
                search: search,
                location: locationFilter,
                service: serviceFilter,
                page: page,
                limit: 6 // Reduced for better testing
            };

            const data = await panditApi.getAllPandits(filters);
            console.log('Pandits API response:', data);

            setPandits(data.pandits || []);
            setTotalPages(data.totalPages || 1);

            // Enhanced debug info
            setDebugInfo(`
                Loaded ${data.pandits?.length || 0} pandits from API | 
                Page ${page} of ${data.totalPages || 1} | 
                Total: ${data.total || 0} pandits
            `);

        } catch (err) {
            console.error('Error loading pandits:', err);
            setError('Failed to load pandits from API');
            setDebugInfo('Error: ' + err.message);
            // Fallback to mock data
            setPandits(getMockPandits());
        } finally {
            setLoading(false);
        }
    };

    // Enhanced mock data with more items
    const getMockPandits = () => [
        {
            _id: "1",
            name: "Soham Utpat",
            location: "Pune",
            services: ["Vaastu Shanti", "Pooja"],
            contact: "8767119282",
            email: "soham.utpat.sit.comp@gmail.com",
            rating: 4.2,
            image: "/images/icon.png",
            experience: 5
        },
        {
            _id: "2",
            name: "Atharv Kulkarni",
            location: "Pune",
            services: ["Ganesh Puja"],
            contact: "9876543210",
            email: "atharv@example.com",
            rating: 4.5,
            image: "/images/icon.png",
            experience: 8
        },
        {
            _id: "3",
            name: "Rajesh Sharma",
            location: "Mumbai",
            services: ["Bhumi Pujan", "Griha Pravesh"],
            contact: "9123456789",
            email: "rajesh@example.com",
            rating: 4.7,
            image: "/images/icon.png",
            experience: 12
        },
        {
            _id: "4",
            name: "Priya Deshpande",
            location: "Delhi",
            services: ["Mangalagaur Puja", "Naming Ceremony"],
            contact: "8987654321",
            email: "priya@example.com",
            rating: 4.8,
            image: "/images/icon.png",
            experience: 10
        },
        {
            _id: "5",
            name: "Anil Kumar",
            location: "Bangalore",
            services: ["Lakshmi Puja", "Satya Narayan Puja"],
            contact: "7890123456",
            email: "anil@example.com",
            rating: 4.3,
            image: "/images/icon.png",
            experience: 7
        },
        {
            _id: "6",
            name: "Sunil Patel",
            location: "Ahmedabad",
            services: ["Rudrabhishek", "Laghu Rudra Puja"],
            contact: "8901234567",
            email: "sunil@example.com",
            rating: 4.6,
            image: "/images/icon.png",
            experience: 15
        }
    ];

    const handleNextPage = () => {
        if (page < totalPages) {
            setPage(page + 1);
        }
    };

    const handlePrevPage = () => {
        if (page > 1) {
            setPage(page - 1);
        }
    };
    const maskContact = (number) => {
        if (!number) return "**********";
        return number.replace(/.(?=.{4})/g, "*");
    };
const userIsLoggedIn =
  !!localStorage.getItem("adminToken") ||
  !!localStorage.getItem("panditToken");

    return (
        <div className="find-pandit">
            <h1>Find Pandit</h1>

            {/* Enhanced Debug Info */}
            {debugInfo && (
                <div className="debug-info" style={{
                    background: '#e3f2fd',
                    color: '#1565c0',
                    padding: '10px',
                    borderRadius: '5px',
                    marginBottom: '15px',
                    fontSize: '14px',
                    borderLeft: '4px solid #2196f3'
                }}>
                    <strong>Debug Info(only for testing):</strong> {debugInfo}
                </div>
            )}

            {/* Search and Filters */}
            <div className="filters">
                <input
                    type="text"
                    placeholder="Search by Name or Service"
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                />
                <select value={locationFilter} onChange={e => setLocationFilter(e.target.value)}>
                    <option value="">All Locations</option>
                    {locations.map((loc, idx) => (
                        <option key={idx} value={loc}>{loc}</option>
                    ))}
                </select>
                <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)}>
                    <option value="">All Services</option>
                    {services.map((srv, idx) => (
                        <option key={idx} value={srv}>{srv}</option>
                    ))}
                </select>
            </div>

            {loading && <LoadingSpinner text="Loading pandits..." />}
            {error && <div className="error">{error}</div>}

            {/* Pandit Cards */}
            <div className="pandit-grid">
                {pandits.map(pandit => (
                    <div key={pandit._id || pandit.id} className="pandit-card">
                        <img src={pandit.image} alt={pandit.name}
                            onError={(e) => {
                                e.target.src = '/images/icon.png';
                            }} />
                        <h3>{pandit.name}</h3>
                        <p className="services">
                            <strong>Services:</strong> {Array.isArray(pandit.services) ? pandit.services.join(", ") : pandit.services}
                        </p>
                        <p><strong>Location:</strong> {pandit.location}</p>
                        <p><strong>Rating:</strong> {pandit.rating} ⭐</p>
                        <p><strong>Experience:</strong> {pandit.experience || 'N/A'} years</p>
                        <p>
                            <strong>Contact:</strong>{" "}
                            {userIsLoggedIn ? pandit.contact : maskContact(pandit.contact)}
                        </p>


                        <button className="pandit-book-btn">Book</button>
                    </div>
                ))}
            </div>

            {!loading && pandits.length === 0 && (
                <div className="no-results">
                    <h3>No pandits found</h3>
                    <p>Try adjusting your search filters or check if your backend is running.</p>
                    <small>Current filters:
                        {search && ` Search: "${search}"`}
                        {locationFilter && ` Location: "${locationFilter}"`}
                        {serviceFilter && ` Service: "${serviceFilter}"`}
                        {!search && !locationFilter && !serviceFilter && ' No filters applied'}
                    </small>
                </div>
            )}

            {/* Enhanced Pagination */}
            {pandits.length > 0 && (
                <div className="pagination">
                    <button
                        onClick={handlePrevPage}
                        disabled={page === 1 || loading}
                        className={page === 1 ? 'disabled' : ''}
                    >
                        ← Previous
                    </button>

                    <span className="page-info">
                        Page {page} of {totalPages}
                        {totalPages > 1 && ` (${pandits.length} items)`}
                    </span>

                    <button
                        onClick={handleNextPage}
                        disabled={page >= totalPages || loading}
                        className={page >= totalPages ? 'disabled' : ''}
                    >
                        Next →
                    </button>
                </div>
            )}
        </div>
    );
}