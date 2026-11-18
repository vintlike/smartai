package com.smartai.server.auth.security;

import com.smartai.server.auth.model.LoginUser;
import com.smartai.server.system.entity.SysRole;
import com.smartai.server.system.entity.SysUser;
import com.smartai.server.system.mapper.SysMenuMapper;
import com.smartai.server.system.mapper.SysRoleMapper;
import com.smartai.server.system.mapper.SysUserMapper;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

@Component
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenProvider tokenProvider;
    private final SysUserMapper userMapper;
    private final SysRoleMapper roleMapper;
    private final SysMenuMapper menuMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        String token = resolveToken(request);
        if (token != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            authenticate(request, token);
        }
        filterChain.doFilter(request, response);
    }

    private void authenticate(HttpServletRequest request, String token) {
        try {
            String userId = tokenProvider.parseUserId(token);
            SysUser user = userMapper.selectById(userId);
            if (user == null || !Integer.valueOf(1).equals(user.getIsEnabled())) {
                return;
            }
            List<SysRole> roles = roleMapper.selectByUserId(userId);
            List<String> roleCodes = roles.stream().map(SysRole::getCode).filter(StringUtils::hasText).toList();
            boolean admin = roleCodes.stream().anyMatch(code -> "administrator".equals(code) || "admin".equals(code));
            Set<String> perms = admin ? Set.of() : new HashSet<>(menuMapper.selectPermsByUserId(userId));

            LoginUser principal = new LoginUser(user.getId(), user.getUsername(), user.getRealName(), roleCodes, perms, admin);
            List<SimpleGrantedAuthority> authorities = new ArrayList<>();
            roleCodes.forEach(code -> authorities.add(new SimpleGrantedAuthority("ROLE_" + code)));
            perms.forEach(perm -> authorities.add(new SimpleGrantedAuthority(perm)));

            UsernamePasswordAuthenticationToken authentication =
                    new UsernamePasswordAuthenticationToken(principal, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
        } catch (JwtException | IllegalArgumentException e) {
            SecurityContextHolder.clearContext();
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (!StringUtils.hasText(header)) {
            return null;
        }
        return header.startsWith("Bearer ") ? header.substring(7) : header;
    }
}
