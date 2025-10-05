import api from './api';

export const forumApi = {
  // Class management
  getClasses: (teacherId) => api.get(`/forumClasses?teacherId=${teacherId}`),
  createClass: (classData) => api.post('/forumClasses', classData),
  updateClass: (id, classData) => api.patch(`/forumClasses/${id}`, classData),
  deleteClass: (id) => api.delete(`/forumClasses/${id}`),
  removeMember: (memberId) => api.delete(`/forumMembers/${memberId}`),

  // Class members
  getClassMembers: (classId) => api.get(`/forumMembers?classId=${classId}`),
  addMember: (classId, email) => {
    // First find user by email
    return api.get(`/users?email=${email}`)
      .then(response => {
        if (response.data.length === 0) {
          throw new Error('User not found');
        }
        const user = response.data[0];
        return api.post('/forumMembers', {
          classId,
          userId: user.id,
          role: 'student',
          joinedAt: new Date().toISOString()
        });
      });
  },
  removeMember: (memberId) => api.delete(`/forumMembers/${memberId}`),
  
  // Class Courses - THÊM MỚI
  getClassCourses: (classId) => api.get(`/forumCourses?classId=${classId}`),
  addCourseToClass: (classId, courseId, teacherId) => api.post('/forumCourses', {
    classId,
    courseId,
    addedBy: teacherId,
    addedAt: new Date().toISOString()
  }),
  removeCourseFromClass: (id) => api.delete(`/forumCourses/${id}`),
  
  // Posts
  getPosts: (classId) => api.get(`/forumPosts?classId=${classId}`),
  createPost: (postData) => api.post('/forumPosts', postData),
  updatePost: (id, postData) => api.patch(`/forumPosts/${id}`, postData),
  deletePost: (id) => api.delete(`/forumPosts/${id}`),
  
  // My classes (for students) - SỬA LẠI
  getMyClasses: (userId) => api.get(`/forumMembers?userId=${userId}`),
};

export const forumService = {
  getClassWithDetails: async (classId) => {
    const [classData, members, posts, classCourses] = await Promise.all([
      api.get(`/forumClasses/${classId}`),
      forumApi.getClassMembers(classId),
      forumApi.getPosts(classId),
      forumApi.getClassCourses(classId)
    ]);
    
    // Get member details
    const memberDetails = await Promise.all(
      members.data.map(member => 
        api.get(`/users/${member.userId}`)
      )
    );
    
    // Get post author details
    const postDetails = await Promise.all(
      posts.data.map(post =>
        api.get(`/users/${post.userId}`).then(userResponse => ({
          ...post,
          author: userResponse.data
        }))
      )
    );

    // Get course details
    const courseDetails = await Promise.all(
      classCourses.data.map(course =>
        api.get(`/courses/${course.courseId}`).then(courseResponse => ({
          ...course,
          course: courseResponse.data
        }))
      )
    );
    
    return {
      ...classData.data,
      members: memberDetails.map((response, index) => ({
        ...members.data[index],
        user: response.data
      })),
      posts: postDetails,
      courses: courseDetails
    };
  },

  // THÊM MỚI: Service để lấy lớp học của học sinh với đầy đủ thông tin
  getMyClassesWithDetails: async (userId) => {
    // Lấy danh sách lớp học mà học sinh tham gia
    const myClassesResponse = await forumApi.getMyClasses(userId);
    
    const classesWithDetails = await Promise.all(
      myClassesResponse.data.map(async (member) => {
        try {
          // Lấy thông tin lớp học
          const classResponse = await api.get(`/forumClasses/${member.classId}`);
          const classItem = classResponse.data;
          
          // Lấy thông tin giáo viên
          const teacherResponse = await api.get(`/users/${classItem.teacherId}`);
          
          // Lấy số lượng thành viên
          const membersResponse = await forumApi.getClassMembers(classItem.id);
          
          // Lấy khóa học trong lớp
          const coursesResponse = await forumApi.getClassCourses(classItem.id);
          const coursesWithDetails = await Promise.all(
            coursesResponse.data.map(course =>
              api.get(`/courses/${course.courseId}`).then(courseRes => courseRes.data)
            )
          );

          return {
            ...classItem,
            teacher: teacherResponse.data,
            memberCount: membersResponse.data.length,
            courseCount: coursesResponse.data.length,
            joinedAt: member.joinedAt,
            courses: coursesWithDetails
          };
        } catch (error) {
          console.error('Error fetching class details:', error);
          return null;
        }
      })
    );

    return classesWithDetails.filter(Boolean);
  }
};