import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

function AdminPage() {
    const [activeTab, setActiveTab] = useState('posts'); // 'posts', 'users', 'comments'
    const [reports, setReports] = useState([]);
    const [loading, setLoading] = useState(true);

    // Функція завантаження репортів за типом
    const fetchReports = (type) => {
        setLoading(true);
        axios.get(`/api/reports/${type}`)
            .then(res => {
                setReports(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setReports([]);
                setLoading(false);
            });
    };

    // Завантажуємо репорти при зміні вкладки
    useEffect(() => {
        fetchReports(activeTab);
    }, [activeTab]);

    // Відображення таблиці для кожного типу репортів
    const renderTable = () => {
        if (reports.length === 0) return <p>Немає скарг</p>;

        switch (activeTab) {
            case 'posts':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>ID Поста</th>
                                <th>Причина</th>
                                <th>Користувач</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/posts/${report.post_id}`}>{report.post_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'users':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>ID Користувача</th>
                                <th>Причина</th>
                                <th>Користувач, що скаржиться</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/profile/${report.reported_user_id}`}>{report.reported_username}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            case 'comments':
                return (
                    <table className="report-table">
                        <thead>
                            <tr>
                                <th>ID Коментаря</th>
                                <th>Причина</th>
                                <th>Користувач</th>
                                <th>Дата</th>
                            </tr>
                        </thead>
                        <tbody>
                            {reports.map((report, i) => (
                                <tr key={i}>
                                    <td><Link to={`/comment/${report.comment_id}`}>{report.comment_id}</Link></td>
                                    <td>{report.reason}</td>
                                    <td><Link to={`/profile/${report.reporter_id}`}>{report.reporter_username}</Link></td>
                                    <td>{new Date(report.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                );
            default:
                return null;
        }
    };

    if (loading) return <p>Завантаження...</p>;

    return (
        <div className="admin-container">
            <h2>Скарги</h2>

            {/* Вкладки */}
            <div className="tabs">
                <button
                    className={activeTab === 'posts' ? 'active' : ''}
                    onClick={() => setActiveTab('posts')}
                >
                    Репорти на пости
                </button>
                <button
                    className={activeTab === 'users' ? 'active' : ''}
                    onClick={() => setActiveTab('users')}
                >
                    Репорти на користувачів
                </button>
                <button
                    className={activeTab === 'comments' ? 'active' : ''}
                    onClick={() => setActiveTab('comments')}
                >
                    Репорти на коментарі
                </button>
            </div>

            {/* Таблиця з репортами */}
            {renderTable()}

            <style>{`
                .tabs {
                    margin-bottom: 20px;
                }
                .tabs button {
                    margin-right: 10px;
                    padding: 8px 16px;
                    border: none;
                    background-color: #eee;
                    cursor: pointer;
                    border-radius: 4px;
                    font-weight: 600;
                }
                .tabs button.active {
                    background-color: #007bff;
                    color: white;
                }
                .report-table {
                    width: 100%;
                    border-collapse: collapse;
                }
                .report-table th, .report-table td {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    text-align: left;
                }
                .report-table th {
                    background-color: #f8f8f8;
                }
            `}</style>
        </div>
    );
}

export default AdminPage;
